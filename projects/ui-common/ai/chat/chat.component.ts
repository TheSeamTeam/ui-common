import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  ViewChild,
} from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { BehaviorSubject } from 'rxjs'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { ChatMessage } from '../providers/ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { TheSeamChatContextRegistry } from '../chat-context-registry.service'
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
  private readonly _chatContextRegistry = inject(TheSeamChatContextRegistry, {
    optional: true,
  })
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _ngZone = inject(NgZone)

  @ViewChild('messageList') private _messageList?: ElementRef<HTMLElement>
  @ViewChild(TheSeamOverlayScrollbarDirective)
  private _messageListScrollbar?: TheSeamOverlayScrollbarDirective

  readonly placeholder = input<string>('Type a message...')

  // Internal conversation state — same as before, just relocated for clarity.
  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []

  // Pixels of slack allowed when deciding if the viewport is "at the bottom".
  private readonly _pinnedThreshold = 32
  private _isPinnedToBottom = true
  private _forceScrollOnNextResize = false

  private readonly _loadingSubject = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loadingSubject.asObservable()

  ngAfterViewInit() {
    const scrollInstance = this._messageListScrollbar?.instance
    if (!scrollInstance) {
      return
    }
    this._ngZone.runOutsideAngular(() => {
      scrollInstance.options({
        callbacks: {
          onScroll: () => this._updatePinnedState(),
          onContentSizeChanged: () => this._maybeScrollToBottom(),
        },
      })
    })
  }

  async _onMessageSent(text: string) {
    if (this._loadingSubject.value || !this._provider) {
      if (!this._provider) console.error('No chat provider configured.')
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
    this._forceScrollOnNextResize = true
    this._cdr.markForCheck()

    this._loadingSubject.next(true)
    try {
      const contexts = (await this._chatContextRegistry?.snapshot()) ?? []
      // NOTE: Observable provider — bridge with firstValueFrom until Task 9
      // restructures this method around the new session flow.
      const { firstValueFrom } = await import('rxjs')
      const response = await firstValueFrom(
        this._provider.chat({
          messages: this._messages,
          contexts: contexts.length === 0 ? undefined : contexts,
        }),
      )

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
