import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core'
import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { BehaviorSubject } from 'rxjs'

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
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamChatComponent implements AfterViewChecked {
  private readonly _provider = inject(THESEAM_CHAT_PROVIDER, { optional: true })
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() systemPrompt = ''
  @Input() placeholder = 'Type a message...'

  @ViewChild('messageList') private _messageList?: ElementRef<HTMLElement>

  readonly _loadingSubject = new BehaviorSubject<boolean>(false)

  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []
  private _shouldScroll = false

  ngAfterViewChecked() {
    if (this._shouldScroll) {
      this._scrollToBottom()
      this._shouldScroll = false
    }
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
    this._shouldScroll = true
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
      this._shouldScroll = true
    } catch (err) {
      console.error('Chat provider error:', err)
    } finally {
      this._loadingSubject.next(false)
      this._cdr.markForCheck()
    }
  }

  private _scrollToBottom() {
    const el = this._messageList?.nativeElement
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }
}
