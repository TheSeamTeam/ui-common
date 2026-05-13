import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs'
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import {
  ChatMessage,
  ChatSession,
  ChatSessionStaleError,
} from '../providers/ai-provider'
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
export class TheSeamChatComponent implements AfterViewInit, OnDestroy {
  private readonly _provider = inject(THESEAM_CHAT_PROVIDER, { optional: true })
  private readonly _chatContextRegistry = inject(TheSeamChatContextRegistry, {
    optional: true,
  })
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _ngZone = inject(NgZone)

  @ViewChild('messageList') private _messageList?: ElementRef<HTMLElement>
  @ViewChild(TheSeamOverlayScrollbarDirective)
  private _messageListScrollbar?: TheSeamOverlayScrollbarDirective
  @ViewChild(SeamChatInputComponent) private _chatInput?: SeamChatInputComponent

  /**
   * The session this chat should display.
   *
   * - `null` on first init: the component asks the provider for an initial
   *   session via `getInitialSession()` (default app behavior: prefers
   *   `?chatSession=<uid>`, falls back to the user's most recent session).
   * - `null` after init: resets to a new empty chat. Equivalent to calling
   *   `newSession()`.
   * - A session uid: loads and displays that session.
   *
   * Pair with `(sessionIdChange)` for two-way binding.
   */
  readonly sessionId = input<string | null>(null)

  readonly placeholder = input<string>('Type a message...')

  /**
   * Emits whenever the chat's active session changes — after the initial
   * load resolves, after a send creates a new session, after the input is
   * reassigned, or after `newSession()` clears the chat.
   */
  readonly sessionIdChange = output<string | null>()

  /**
   * Emits after the chat has recovered from a server-reported stale-leaf
   * 409. The component has already reloaded the session and restored the
   * user's typed text; consuming apps typically respond by surfacing a toast.
   */
  readonly staleSession = output<void>()

  // Internal conversation state — same as before, just relocated for clarity.
  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []

  // Pixels of slack allowed when deciding if the viewport is "at the bottom".
  private readonly _pinnedThreshold = 32
  private _isPinnedToBottom = true
  private _forceScrollOnNextResize = false

  private readonly _loadingSubject = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loadingSubject.asObservable()

  private _currentSessionId: string | null = null
  private _currentLeafMessageId: string | null = null
  private _initialized = false

  private readonly _sessionLoadRequest$ = new Subject<
    Observable<ChatSession | null>
  >()
  private readonly _destroy$ = new Subject<void>()

  private readonly _initialLoadingSubject = new BehaviorSubject<boolean>(false)
  readonly initialLoading$ = this._initialLoadingSubject.asObservable()

  constructor() {
    this._sessionLoadRequest$
      .pipe(
        tap(() =>
          this._initialLoadingSubject.next(this._messages.length === 0),
        ),
        switchMap((load$) =>
          load$.pipe(
            catchError((err) => {
              console.error('Chat session load failed:', err)
              return of(null)
            }),
          ),
        ),
        takeUntil(this._destroy$),
      )
      .subscribe((session) => {
        this._initialLoadingSubject.next(false)
        if (session) {
          const wasNoSession = this._currentSessionId === null
          this._applySession(session)
          if (wasNoSession) {
            this.sessionIdChange.emit(session.uid)
          }
        }
        this._cdr.markForCheck()
      })

    effect(() => {
      const incoming = this.sessionId()
      if (!this._initialized) {
        this._initialize(incoming)
      } else {
        this._reactToSessionInputChange(incoming)
      }
    })
  }

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

  ngOnDestroy() {
    this._destroy$.next()
    this._destroy$.complete()
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

  private _initialize(incoming: string | null): void {
    this._initialized = true
    if (!this._provider) {
      console.error('No chat provider configured.')
      return
    }
    if (incoming) {
      this._sessionLoadRequest$.next(this._provider.getSession(incoming))
    } else {
      this._sessionLoadRequest$.next(this._provider.getInitialSession())
    }
  }

  private _reactToSessionInputChange(incoming: string | null): void {
    if (incoming === this._currentSessionId) return
    if (!this._provider) {
      console.error('No chat provider configured.')
      return
    }
    if (incoming === null) {
      this._sessionLoadRequest$.next(EMPTY)
      this._currentSessionId = null
      this._currentLeafMessageId = null
      this._messages = []
      this._displayMessages = []
      this.sessionIdChange.emit(null)
      this._cdr.markForCheck()
      return
    }
    this._sessionLoadRequest$.next(this._provider.getSession(incoming))
  }

  private _applySession(session: ChatSession): void {
    this._currentSessionId = session.uid
    this._currentLeafMessageId = session.leafMessageId
    this._messages = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
    this._displayMessages = session.messages.map((m) => ({
      uid: m.uid,
      role: m.role,
      segments:
        m.role === 'assistant'
          ? parseChatResponse(m.content)
          : [{ type: 'markdown', content: m.content }],
      timestamp: new Date(m.created),
    }))
    this._forceScrollOnNextResize = true
  }
}
