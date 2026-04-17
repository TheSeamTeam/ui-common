import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core'
import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { BehaviorSubject } from 'rxjs'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { ChatMessage } from '../providers/ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { parseChatResponse } from './chat-response-parser'
import {
  ChatMessageDisplayModel,
  SeamChatMessageComponent,
} from './chat-message.component'
import { SeamChatInputComponent } from './chat-input.component'

@Component({
  selector: 'seam-chat',
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    SeamChatMessageComponent,
    SeamChatInputComponent,
    TheSeamOverlayScrollbarDirective,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamChatComponent implements AfterViewInit {
  private readonly _provider = inject(THESEAM_CHAT_PROVIDER, { optional: true })
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _ngZone = inject(NgZone)

  @Input() systemPrompt = ''
  @Input() placeholder = 'Type a message...'

  @ViewChild('messageList') private _messageList?: ElementRef<HTMLElement>
  @ViewChild(TheSeamOverlayScrollbarDirective)
  private _messageListScrollbar?: TheSeamOverlayScrollbarDirective

  readonly _loadingSubject = new BehaviorSubject<boolean>(false)

  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []

  // Pixels of slack allowed when deciding if the viewport is "at the bottom".
  // Small enough that scrolling up a line unpins, but forgiving of sub-pixel drift.
  private readonly _pinnedThreshold = 32

  // True when the viewport is (or should be) tracking the latest content. Starts
  // true so the first messages scroll into view. Updated on every scroll event.
  private _isPinnedToBottom = true

  // Set when a user action (e.g. sending a message) requires the view to jump
  // to the bottom on the next content-size change, regardless of pinned state.
  // Cleared as soon as it's consumed.
  private _forceScrollOnNextResize = false

  ngAfterViewInit() {
    const scrollInstance = this._messageListScrollbar?.instance
    if (!scrollInstance) {
      return
    }
    // OverlayScrollbars callbacks run outside Angular already (the directive's
    // service initializes with runOutsideAngular). These handlers only update
    // local flags and call scroll() — no change detection needed.
    this._ngZone.runOutsideAngular(() => {
      scrollInstance.options({
        callbacks: {
          onScroll: () => this._updatePinnedState(),
          // Fires when the content's scrollable size changes: a new message
          // appended, a custom block finishing its async render, an image
          // finishing loading, etc. This removes the need for a setTimeout
          // hack because we react to actual size changes rather than guessing
          // when rendering has settled.
          onContentSizeChanged: () => this._maybeScrollToBottom(),
        },
      })
    })
  }

  async _onMessageSent(text: string) {
    if (this._loadingSubject.value || !this._provider) {
      if (!this._provider) {
        console.error('No chat provider configured.')
      }
      return
    }

    const userMessage: ChatMessage = { role: 'user', content: text }
    this._messages.push(userMessage)
    this._displayMessages = [
      ...this._displayMessages,
      {
        role: 'user',
        segments: [{ type: 'markdown', content: text }],
        timestamp: new Date(),
      },
    ]
    // The user just sent a message — jump to the bottom even if they had
    // scrolled up previously. Consumed by the next onContentSizeChanged.
    this._forceScrollOnNextResize = true
    this._cdr.markForCheck()

    this._loadingSubject.next(true)
    try {
      const messagesToSend: ChatMessage[] = []
      if (this.systemPrompt) {
        messagesToSend.push({ role: 'system', content: this.systemPrompt })
      }
      messagesToSend.push(...this._messages)

      const response = await this._provider.chat(messagesToSend)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      }
      this._messages.push(assistantMessage)
      this._displayMessages = [
        ...this._displayMessages,
        {
          role: 'assistant',
          segments: parseChatResponse(response.content),
          timestamp: new Date(),
        },
      ]
    } catch (err) {
      console.error('Chat provider error:', err)
    } finally {
      this._loadingSubject.next(false)
      this._cdr.markForCheck()
    }
  }

  private _updatePinnedState() {
    const scrollInstance = this._messageListScrollbar?.instance
    if (!scrollInstance) {
      return
    }
    const info = scrollInstance.scroll()
    this._isPinnedToBottom =
      info.position.y >= info.max.y - this._pinnedThreshold
  }

  private _maybeScrollToBottom() {
    // Auto-scroll only when the user expects it:
    //   - They just sent a message (forceScroll), OR
    //   - They were already following the latest content (pinnedToBottom).
    // If they scrolled up to read an earlier message, we leave their viewport
    // alone so continued content growth (e.g. a streaming answer or an
    // async-rendered block) doesn't keep yanking it back.
    if (this._forceScrollOnNextResize || this._isPinnedToBottom) {
      this._scrollToBottom()
      this._forceScrollOnNextResize = false
    }
  }

  private _scrollToBottom() {
    const scrollInstance = this._messageListScrollbar?.instance
    if (scrollInstance) {
      const state = scrollInstance.getState()
      scrollInstance.scroll({ y: state.contentScrollSize.height })
    }
  }
}
