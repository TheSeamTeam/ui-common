import { defer, Observable, of, throwError } from 'rxjs'
import { delay as rxDelay } from 'rxjs/operators'

import {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

type MockResponse = string | ((messages: ChatMessage[]) => string)

export interface MockAiProviderConfig {
  response?: MockResponse
  initialSession?: ChatSession | null
  sessionsByUid?: ReadonlyMap<string, ChatSession>
  sessionsList?: ChatSessionListItem[]

  /** First chat() call errors with this; subsequent calls succeed normally. */
  throwOnFirstChat?: Error

  /** Artificial delay (ms) applied uniformly. Overridable per method. */
  delayMs?: number
  delayMsByMethod?: Partial<Record<keyof TheSeamAiProvider, number>>
}

type LegacyArg = MockAiProviderConfig | MockResponse | undefined

export class MockAiProvider implements TheSeamAiProvider {
  private readonly _config: MockAiProviderConfig
  private _throwOnNextChat?: Error

  constructor(configOrLegacy?: LegacyArg) {
    if (
      typeof configOrLegacy === 'string' ||
      typeof configOrLegacy === 'function'
    ) {
      this._config = { response: configOrLegacy }
    } else {
      this._config = configOrLegacy ?? {}
    }
    this._throwOnNextChat = this._config.throwOnFirstChat
  }

  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return defer(() => {
      if (this._throwOnNextChat) {
        const err = this._throwOnNextChat
        this._throwOnNextChat = undefined
        return throwError(() => err) as Observable<ChatResponse>
      }
      const content =
        typeof this._config.response === 'function'
          ? this._config.response(request.messages)
          : (this._config.response ?? 'Mock response')
      const response: ChatResponse = {
        content,
        sessionId: request.sessionId ?? `mock-session-${cryptoRandomId()}`,
        label: 'Mock',
        leafMessageId: cryptoRandomId(),
      }
      return this._withDelay('chat', of(response))
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return defer(() =>
      this._withDelay(
        'getInitialSession',
        of(this._config.initialSession ?? null),
      ),
    )
  }

  getRecentSession(): Observable<ChatSession | null> {
    return defer(() =>
      this._withDelay(
        'getRecentSession',
        of(this._config.initialSession ?? null),
      ),
    )
  }

  getSession(uid: string): Observable<ChatSession> {
    return defer(() => {
      const found = this._config.sessionsByUid?.get(uid)
      if (!found) {
        return throwError(
          () => new Error(`MockAiProvider: session not found for uid "${uid}"`),
        )
      }
      return this._withDelay('getSession', of(found))
    })
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return defer(() =>
      this._withDelay('listSessions', of(this._config.sessionsList ?? [])),
    )
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return defer(() => this._withDelay('renameSession', of(undefined as void)))
  }

  deleteSession(_uid: string): Observable<void> {
    return defer(() => this._withDelay('deleteSession', of(undefined as void)))
  }

  private _withDelay<T>(
    method: keyof TheSeamAiProvider,
    source$: Observable<T>,
  ): Observable<T> {
    const ms =
      this._config.delayMsByMethod?.[method] ?? this._config.delayMs ?? 0
    return ms > 0 ? source$.pipe(rxDelay(ms)) : source$
  }
}

function cryptoRandomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
