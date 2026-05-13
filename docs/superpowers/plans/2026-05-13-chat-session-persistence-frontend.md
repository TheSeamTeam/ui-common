# Chat Session Persistence Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `seam-chat` session-aware end-to-end: load prior messages on mount, round-trip sessionId/leafMessageId through chat sends, recover from stale-leaf 409s, and expose the full session surface (read/rename/delete) on `TheSeamAiProvider`. Update the merchant services app's API lib + `AppAiProvider` to consume the new endpoints with two-way binding to a `?chatSession=` query param.

**Architecture:** Two repos, two phases.
- **Phase 1 — `TheSeam.UiCommon`:** Provider interface gains Observable-based session methods + `ChatSessionStaleError`. `TheSeamChatComponent` migrates to signals + control-flow, owns initial-load via `provider.getInitialSession()`, drives a `switchMap`-based load pipeline with HTTP cancellation, and adds a `newSession()` imperative reset + `(sessionIdChange)` / `(staleSession)` outputs.
- **Phase 2 — `TheSeam.MerchantServices.App` (after Phase 1 publishes to `@beta`):** New `ApiChatSessionService`, widened chat DTOs, `ApiHttp.patch()`, `AppAiProvider` implementation including `?chatSession=` query-param prefer-recent fallback, and `base-layout` wires `[(sessionId)]` to a query-param signal.

**Tech Stack:** Angular 20 (signal inputs, `output()`, control-flow blocks), RxJS 7 (`switchMap`/`takeUntil`/`defer`), Jest, Storybook 9 with play functions, CDK Test Harnesses, ngx-quill, ngx-markdown.

**Reference spec:** `docs/superpowers/specs/2026-05-13-chat-session-persistence-frontend-design.md`

---

## Phase 1: TheSeam.UiCommon

> All paths in Phase 1 are relative to `c:\Users\mberry\dev_home\git\TheSeam.UiCommon\`.
> Run all commands from that directory.
> Branch: `marklb/ai-chat-component` (already checked out).
> Use prettier defaults (2-space indent, no semicolons, single quotes, trailing commas) and follow the AGENTS.md naming conventions (`_`-prefixed privates; `readonly` injected fields).

---

### Task 1: New types + ChatSessionStaleError

**Files:**
- Modify: `projects/ui-common/ai/providers/ai-provider.ts`

Replaces the existing minimal interface with the session-aware contract. Existing types stay re-exported through the same file; nothing else changes yet — downstream implementations are broken by this commit and fixed in Tasks 2–4.

- [ ] **Step 1: Rewrite `ai-provider.ts`**

Replace the entire file contents with:

```ts
import { Observable } from 'rxjs'

import { TheSeamChatContextPayload } from '../chat-context'

/**
 * A single conversation turn. Sent to the LLM via `chat()` and produced by
 * `chat()` as the assistant response. Persisted history (with uid + created)
 * is exposed separately via `ChatSessionMessage`.
 */
export interface ChatMessage {
  /** 'user' | 'assistant' in practice; widened to string for forward-compat. */
  role: string
  content: string
}

export interface ChatSessionMessage {
  uid: string
  role: string
  content: string
  /** ISO-8601 datetime of when the message was persisted. */
  created: string
}

export interface ChatSession {
  uid: string
  label: string
  created: string
  lastActivity: string
  leafMessageId: string | null
  messages: ChatSessionMessage[]
}

export interface ChatSessionListItem {
  uid: string
  label: string
  created: string
  lastActivity: string
}

export interface TheSeamAiChatRequest {
  messages: ChatMessage[]
  contexts?: TheSeamChatContextPayload[]
  /** When null, the backend creates a new session and returns its uid. */
  sessionId?: string | null
  /**
   * Required when `sessionId` is set. The uid of the message the client
   * believes is the current leaf. Backend returns 409 if it doesn't match.
   */
  expectedLeafMessageId?: string | null
}

export interface ChatResponse {
  content: string
  sessionId: string
  label: string
  leafMessageId: string
}

/**
 * Errored by `TheSeamAiProvider.chat()` when the server reports the
 * session's leaf has advanced since the client last observed it (HTTP 409).
 * The chat component catches this, reloads the session, and emits
 * `(staleSession)`.
 */
export class ChatSessionStaleError extends Error {
  constructor(
    public readonly sessionId: string,
    public readonly currentLeafMessageId: string | null,
  ) {
    super('Chat session leaf is stale')
    this.name = 'ChatSessionStaleError'
  }
}

export interface TheSeamAiProvider {
  /**
   * Send a chat turn. Errors with `ChatSessionStaleError` when the session's
   * leaf has advanced since the last observed state.
   *
   * Implementations should emit exactly once and complete.
   */
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse>

  /**
   * Hook the chat component calls on mount to ask the provider what session
   * to load. Default app implementation prefers a query-param session uid
   * and falls back to the user's most recent session, but apps can override.
   */
  getInitialSession(): Observable<ChatSession | null>

  /** Returns the user's most-recently-active session, or null if none exists. */
  getRecentSession(): Observable<ChatSession | null>

  /** Loads a specific session with its active-path messages. */
  getSession(uid: string): Observable<ChatSession>

  /** Returns session metadata for the user (no messages). */
  listSessions(): Observable<ChatSessionListItem[]>

  /** Updates a session's user-visible label. */
  renameSession(uid: string, label: string): Observable<void>

  /** Soft-deletes the session. */
  deleteSession(uid: string): Observable<void>
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file alone**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json 2>&1 | grep ai-provider.ts`

Expected: no errors specifically from `ai-provider.ts` (errors will exist elsewhere in the project — those are downstream implementations to be fixed in Tasks 2–4).

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/ai-provider.ts
git commit -m "feat(ai)!: Observable-based session-aware AiProvider interface

Adds ChatSession, ChatSessionMessage, ChatSessionListItem,
ChatSessionStaleError. Widens TheSeamAiChatRequest with optional
sessionId + expectedLeafMessageId; ChatResponse now carries sessionId,
label, and leafMessageId. All provider methods return Observable<T>;
existing providers will be updated in subsequent commits."
```

---

### Task 2: LmStudioAiProvider implements new interface

**Files:**
- Modify: `projects/ui-common/ai/providers/lm-studio.ai-provider.ts`

The OpenAI-compatible providers don't speak the persistence API. They wrap `fetch` so `switchMap` cancellation propagates to an `AbortController`, and session methods return `throwError(() => new Error('Not supported'))`. `getInitialSession()` returns `of(null)`.

- [ ] **Step 1: Replace the file**

```ts
import { defer, Observable, of, throwError } from 'rxjs'

import {
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class LmStudioAiProvider implements TheSeamAiProvider {
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return defer(() => {
      const controller = new AbortController()
      const promise = (async () => {
        const url = 'http://localhost:1234/v1/chat/completions'
        const headers = { 'Content-Type': 'application/json' }
        const model = 'model-identifier'

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        return {
          content,
          // LM Studio is provider-only; no real session backend.
          sessionId: request.sessionId ?? 'lm-studio-local',
          label: 'LM Studio',
          leafMessageId: crypto.randomUUID(),
        } satisfies ChatResponse
      })()
      promise.finally(() => { /* avoid unhandled-rejection on unsubscribe */ })
      return new Observable<ChatResponse>((subscriber) => {
        promise.then(
          (value) => { subscriber.next(value); subscriber.complete() },
          (err) => subscriber.error(err),
        )
        return () => controller.abort()
      })
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getRecentSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getSession(_uid: string): Observable<ChatSession> {
    return throwError(() => new Error('LmStudioAiProvider does not support session persistence.'))
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return of([])
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return throwError(() => new Error('LmStudioAiProvider does not support session persistence.'))
  }

  deleteSession(_uid: string): Observable<void> {
    return throwError(() => new Error('LmStudioAiProvider does not support session persistence.'))
  }
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json 2>&1 | grep lm-studio`

Expected: no errors for `lm-studio.ai-provider.ts`.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/lm-studio.ai-provider.ts
git commit -m "feat(ai): update LmStudioAiProvider for Observable-based interface

Wraps fetch in a custom Observable so switchMap cancellation drives an
AbortController. Session methods return not-supported errors or empty
defaults; LM Studio is provider-only (no persistence backend)."
```

---

### Task 3: OpenRouterAiProvider implements new interface

**Files:**
- Modify: `projects/ui-common/ai/providers/openrouter.ai-provider.ts`

Mirrors Task 2.

- [ ] **Step 1: Replace the file**

```ts
import { defer, Observable, of, throwError } from 'rxjs'

import {
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class OpenRouterAiProvider implements TheSeamAiProvider {
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return defer(() => {
      const controller = new AbortController()
      const promise = (async () => {
        const defaultApiKey =
          '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'
        const url = 'https://openrouter.ai/api/v1/chat/completions'
        const apiKey = localStorage.getItem('openrouter-api-key') || defaultApiKey
        const headers = {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
        const model = 'google/gemini-2.5-flash'

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        return {
          content,
          sessionId: request.sessionId ?? 'openrouter-remote',
          label: 'OpenRouter',
          leafMessageId: crypto.randomUUID(),
        } satisfies ChatResponse
      })()
      promise.finally(() => { /* avoid unhandled-rejection on unsubscribe */ })
      return new Observable<ChatResponse>((subscriber) => {
        promise.then(
          (value) => { subscriber.next(value); subscriber.complete() },
          (err) => subscriber.error(err),
        )
        return () => controller.abort()
      })
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getRecentSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getSession(_uid: string): Observable<ChatSession> {
    return throwError(() => new Error('OpenRouterAiProvider does not support session persistence.'))
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return of([])
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return throwError(() => new Error('OpenRouterAiProvider does not support session persistence.'))
  }

  deleteSession(_uid: string): Observable<void> {
    return throwError(() => new Error('OpenRouterAiProvider does not support session persistence.'))
  }
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json 2>&1 | grep openrouter`

Expected: no errors for `openrouter.ai-provider.ts`.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/openrouter.ai-provider.ts
git commit -m "feat(ai): update OpenRouterAiProvider for Observable-based interface

Wraps fetch in a custom Observable so switchMap cancellation drives an
AbortController. Session methods return not-supported errors or empty
defaults; OpenRouter is provider-only (no persistence backend)."
```

---

### Task 4: MockAiProvider rewrite (TDD)

**Files:**
- Create: `projects/ui-common/ai/providers/mock.ai-provider.spec.ts`
- Modify: `projects/ui-common/ai/providers/mock.ai-provider.ts`

The mock is the most behaviorally rich of the non-API providers. It uses `defer(() => of(value).pipe(delay(...)))` so each subscribe is cold, the delay is honored on every subscription, and unsubscription mid-delay cancels.

- [ ] **Step 1: Write failing spec**

Create `projects/ui-common/ai/providers/mock.ai-provider.spec.ts`:

```ts
import { firstValueFrom, lastValueFrom, take, toArray } from 'rxjs'

import {
  ChatSession,
  ChatSessionStaleError,
} from './ai-provider'
import { MockAiProvider } from './mock.ai-provider'

describe('MockAiProvider', () => {
  it('legacy: accepts a plain string and emits it on chat()', async () => {
    const provider = new MockAiProvider('hello')
    const response = await firstValueFrom(
      provider.chat({ messages: [{ role: 'user', content: 'hi' }] }),
    )
    expect(response.content).toBe('hello')
    expect(response.sessionId).toBeTruthy()
    expect(response.leafMessageId).toBeTruthy()
  })

  it('legacy: accepts a function and applies it to messages on chat()', async () => {
    const provider = new MockAiProvider((messages) => `count:${messages.length}`)
    const response = await firstValueFrom(
      provider.chat({
        messages: [
          { role: 'user', content: 'a' },
          { role: 'assistant', content: 'b' },
          { role: 'user', content: 'c' },
        ],
      }),
    )
    expect(response.content).toBe('count:3')
  })

  it('returns null from getInitialSession when not configured', async () => {
    const provider = new MockAiProvider({})
    const session = await firstValueFrom(provider.getInitialSession())
    expect(session).toBeNull()
  })

  it('returns the configured initialSession from getInitialSession', async () => {
    const session: ChatSession = {
      uid: 's1',
      label: 'Saved',
      created: '2026-05-13T00:00:00Z',
      lastActivity: '2026-05-13T00:00:00Z',
      leafMessageId: 'm1',
      messages: [
        { uid: 'm1', role: 'user', content: 'hi', created: '2026-05-13T00:00:00Z' },
      ],
    }
    const provider = new MockAiProvider({ initialSession: session })
    expect(await firstValueFrom(provider.getInitialSession())).toEqual(session)
  })

  it('throws ChatSessionStaleError once when throwOnFirstChat is configured', async () => {
    const err = new ChatSessionStaleError('s1', 'mX')
    const provider = new MockAiProvider({ response: 'ok', throwOnFirstChat: err })

    await expect(
      firstValueFrom(provider.chat({ messages: [{ role: 'user', content: 'a' }] })),
    ).rejects.toBe(err)

    // Second call succeeds — the one-shot was consumed.
    const r = await firstValueFrom(
      provider.chat({ messages: [{ role: 'user', content: 'a' }] }),
    )
    expect(r.content).toBe('ok')
  })

  it('honors delayMs and is cancellable mid-delay', async () => {
    const provider = new MockAiProvider({ response: 'late', delayMs: 200 })
    const obs$ = provider.chat({ messages: [{ role: 'user', content: 'a' }] })

    const sub = obs$.subscribe({
      next: () => fail('should not emit when unsubscribed mid-delay'),
    })
    sub.unsubscribe()
    // Wait long enough for the delay to have elapsed; sub already unsubscribed.
    await new Promise((resolve) => setTimeout(resolve, 300))
    // If sub did emit, the above fail() would have thrown.
  })

  it('returns getSession from sessionsByUid', async () => {
    const session: ChatSession = {
      uid: 'sX',
      label: 'X',
      created: '', lastActivity: '', leafMessageId: null, messages: [],
    }
    const provider = new MockAiProvider({
      sessionsByUid: new Map([['sX', session]]),
    })
    expect(await firstValueFrom(provider.getSession('sX'))).toEqual(session)
  })

  it('errors getSession when uid is not in sessionsByUid', async () => {
    const provider = new MockAiProvider({ sessionsByUid: new Map() })
    await expect(firstValueFrom(provider.getSession('missing'))).rejects.toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the failing test**

Run: `npm run test:ci -- --testPathPattern='mock.ai-provider.spec' 2>&1 | tail -40`

Expected: FAIL — `MockAiProvider` doesn't yet expose the new shape.

- [ ] **Step 3: Replace `mock.ai-provider.ts`**

```ts
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
    if (typeof configOrLegacy === 'string' || typeof configOrLegacy === 'function') {
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
          : this._config.response ?? 'Mock response'
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
    return defer(() => this._withDelay('getInitialSession', of(this._config.initialSession ?? null)))
  }

  getRecentSession(): Observable<ChatSession | null> {
    return defer(() => this._withDelay('getRecentSession', of(this._config.initialSession ?? null)))
  }

  getSession(uid: string): Observable<ChatSession> {
    return defer(() => {
      const found = this._config.sessionsByUid?.get(uid)
      if (!found) {
        return throwError(() => new Error(`MockAiProvider: session not found for uid "${uid}"`))
      }
      return this._withDelay('getSession', of(found))
    })
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return defer(() => this._withDelay('listSessions', of(this._config.sessionsList ?? [])))
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return defer(() => this._withDelay('renameSession', of(undefined as void)))
  }

  deleteSession(_uid: string): Observable<void> {
    return defer(() => this._withDelay('deleteSession', of(undefined as void)))
  }

  private _withDelay<T>(method: keyof TheSeamAiProvider, source$: Observable<T>): Observable<T> {
    const ms = this._config.delayMsByMethod?.[method] ?? this._config.delayMs ?? 0
    return ms > 0 ? source$.pipe(rxDelay(ms)) : source$
  }
}

function cryptoRandomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:ci -- --testPathPattern='mock.ai-provider.spec' 2>&1 | tail -30`

Expected: PASS for all 8 tests.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/ai/providers/mock.ai-provider.ts projects/ui-common/ai/providers/mock.ai-provider.spec.ts
git commit -m "feat(ai): rewrite MockAiProvider for session-aware interface

Adds configurable initialSession, sessionsByUid, sessionsList,
throwOnFirstChat (one-shot), delayMs / delayMsByMethod. Methods use
defer(of(...).pipe(delay(...))) so subscriptions are cold and
cancellable mid-delay. Legacy string/function constructor preserved."
```

---

### Task 5: SeamChatInputComponent restoreText()

**Files:**
- Modify: `projects/ui-common/ai/chat/chat-input.component.ts`

Adds a tiny imperative method used by the parent chat component during stale-leaf recovery.

- [ ] **Step 1: Add `restoreText` to the class**

Append immediately after the existing `_onSend()` method in `chat-input.component.ts`:

```ts
  /**
   * Restores the given text into the input control. Called by the parent
   * chat component during stale-leaf recovery so the user can edit and
   * resend their message after the conversation is refreshed.
   */
  restoreText(text: string): void {
    this._control.setValue(text)
  }
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat-input.component.ts
git commit -m "feat(ai): add SeamChatInputComponent.restoreText for stale-leaf recovery"
```

---

### Task 6: Widen ChatMessageDisplayModel

**Files:**
- Modify: `projects/ui-common/ai/chat/chat-message.component.ts`

The display model gains an optional `uid` (for persisted messages) and widens `role` from `'user' | 'assistant'` to `string` so unknown roles pass through (matches the provider's `ChatMessage.role` widening).

- [ ] **Step 1: Update the interface and the template guards**

Replace the existing `ChatMessageDisplayModel` declaration with:

```ts
export interface ChatMessageDisplayModel {
  /** Present for messages loaded from a persisted session. */
  uid?: string
  /** 'user' | 'assistant' rendered specially; other roles fall through to a neutral style. */
  role: string
  segments: ChatContentSegment[]
  timestamp: Date
}
```

The two template class bindings (`seam-chat-message--user`, `seam-chat-message--assistant`) continue to work since they're already string-equality checks; the "You" / "Assistant" label expression already collapses anything non-user to "Assistant" which is acceptable for the neutral fallback.

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat-message.component.ts
git commit -m "feat(ai): widen ChatMessageDisplayModel.role to string + add optional uid"
```

---

### Task 7: TheSeamChatComponent shell migration (signals, control-flow, inject ordering, private subjects)

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.ts`
- Modify: `projects/ui-common/ai/chat/chat.component.html`

This task changes structure with **no behavior change**. After this commit, the existing storybook stories still render correctly and the existing tests pass. Session work lands in Tasks 8–10.

- [ ] **Step 1: Replace `chat.component.ts` with the signal-migrated shell**

```ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
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
```

The temporary inline `firstValueFrom` bridge keeps existing storybook stories working through this transitional commit. Task 9 replaces it with the full session-aware send flow.

- [ ] **Step 2: Replace `chat.component.html` with control-flow blocks**

```html
<div class="seam-chat">
  <div class="seam-chat__messages" #messageList seamOverlayScrollbar>
    @for (msg of _displayMessages; track $index) {
      <seam-chat-message [message]="msg"></seam-chat-message>
    }

    @if (loading$ | async) {
      <div class="seam-chat__loading">
        <span>Thinking...</span>
      </div>
    }
  </div>

  <seam-chat-input
    [placeholder]="placeholder()"
    [disabled]="!!(loading$ | async)"
    (messageSent)="_onMessageSent($event)"
  ></seam-chat-input>
</div>
```

- [ ] **Step 3: Run existing tests + verify build**

Run: `npm run test:ci -- --testPathPattern='chat.component.spec' 2>&1 | tail -20`

Expected: existing tests still pass (the `FakeAiProvider` returns `Promise` and the shell still consumes the provider via Promise-like bridge — they're updated in Task 12).

If the existing test's `FakeAiProvider.chat()` returns `Promise<ChatResponse>` and the new interface expects `Observable<ChatResponse>`, you'll get a TypeScript error from `chat.component.spec.ts`. If so, this is the right moment to add a one-line shim in the spec:

```ts
// At the top of chat.component.spec.ts, inside FakeAiProvider — temporary:
import { from, Observable, of } from 'rxjs'

class FakeAiProvider implements TheSeamAiProvider {
  // ... existing fields ...
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    this.lastRequest = request
    return of({
      content: this.response,
      sessionId: 'mock', label: 'Mock', leafMessageId: 'leaf-1',
    })
  }
  getInitialSession() { return of(null) }
  getRecentSession() { return of(null) }
  getSession() { return of({} as ChatSession) }
  listSessions() { return of([]) }
  renameSession() { return of(undefined) }
  deleteSession() { return of(undefined) }
}
```

(Full simulator rework lands in Task 12 — this shim just keeps the existing assertions runnable.)

Then run `npm run test:ci -- --testPathPattern='chat.component.spec'` again. Expected: PASS.

Run: `npm run build:ui-common 2>&1 | tail -20`

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.ts projects/ui-common/ai/chat/chat.component.html projects/ui-common/ai/chat/chat.component.spec.ts
git commit -m "refactor(ai): migrate seam-chat to signal inputs and control-flow

inject() calls hoisted above inputs/outputs; placeholder migrated to
signal input(); BehaviorSubject hidden, exposed via loading\$; template
uses @for / @if. Existing send flow preserved with a transitional
firstValueFrom bridge; the session-aware lifecycle lands in subsequent
commits. FakeAiProvider shim added to chat.component.spec to satisfy
the new Observable-typed interface."
```

---

### Task 8: Add session state + load pipeline + lifecycle effect

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.ts`

This task wires the load pipeline but doesn't yet drive it from a `sessionId` input or use it for session resolution from the input. It establishes the plumbing so subsequent tasks can hook in.

- [ ] **Step 1: Add session-aware state + pipeline**

Make the following additions to `chat.component.ts`:

Update the imports at the top to add `effect`, `OnDestroy`, plus `EMPTY`, `Observable`, `Subject`, `of` from `rxjs`, and `catchError`, `switchMap`, `takeUntil`, `tap` from `rxjs/operators`.

Update the imports block:

```ts
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
```

Update the class declaration to `implements AfterViewInit, OnDestroy` and replace the existing input/output region with:

```ts
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
```

In the field block, add the session state below the existing message fields:

```ts
  private _currentSessionId: string | null = null
  private _currentLeafMessageId: string | null = null
  private _initialized = false

  private readonly _sessionLoadRequest$ = new Subject<Observable<ChatSession | null>>()
  private readonly _destroy$ = new Subject<void>()

  private readonly _initialLoadingSubject = new BehaviorSubject<boolean>(false)
  readonly initialLoading$ = this._initialLoadingSubject.asObservable()

  @ViewChild(SeamChatInputComponent) private _chatInput?: SeamChatInputComponent
```

Add a `constructor()` (place after the ViewChild block, before `ngAfterViewInit`):

```ts
  constructor() {
    this._sessionLoadRequest$
      .pipe(
        tap(() => this._initialLoadingSubject.next(this._messages.length === 0)),
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
```

Add `ngOnDestroy` (after `ngAfterViewInit`):

```ts
  ngOnDestroy() {
    this._destroy$.next()
    this._destroy$.complete()
  }
```

Add the private helpers at the bottom of the class (after `_scrollToBottom`):

```ts
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
      this.newSession()
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build:ui-common 2>&1 | tail -20`

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.ts
git commit -m "feat(ai): add session state and load pipeline to seam-chat

Adds sessionId / sessionIdChange / staleSession on the component plus
an effect-driven initialize / reactToSessionInputChange dispatch into a
switchMap-based load pipeline. Pipeline emits initial loading state,
applies sessions to internal display + history models, and emits
sessionIdChange when the first session resolves. Send flow is updated
in the next commit."
```

---

### Task 9: Session-aware send flow

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.ts`

Replace the Task-7 transitional `_onMessageSent` with the session-aware version that round-trips `sessionId` + `expectedLeafMessageId` and dispatches stale-leaf recovery.

- [ ] **Step 1: Replace `_onMessageSent`**

Replace the existing `async _onMessageSent(...)` method body with:

```ts
  async _onMessageSent(text: string): Promise<void> {
    if (this._loadingSubject.value) return
    if (!this._provider) {
      console.error('No chat provider configured.')
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
    this._loadingSubject.next(true)
    this._cdr.markForCheck()

    const contexts = (await this._chatContextRegistry?.snapshot()) ?? []
    this._provider
      .chat({
        messages: this._messages,
        contexts: contexts.length === 0 ? undefined : contexts,
        sessionId: this._currentSessionId,
        expectedLeafMessageId: this._currentLeafMessageId,
      })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this._messages.push({ role: 'assistant', content: response.content })
          this._displayMessages = [
            ...this._displayMessages,
            {
              role: 'assistant',
              segments: parseChatResponse(response.content),
              timestamp: new Date(),
            },
          ]
          const wasNoSession = this._currentSessionId === null
          this._currentSessionId = response.sessionId
          this._currentLeafMessageId = response.leafMessageId
          if (wasNoSession) {
            this.sessionIdChange.emit(response.sessionId)
          }
          this._loadingSubject.next(false)
          this._cdr.markForCheck()
        },
        error: (err) => {
          if (err instanceof ChatSessionStaleError) {
            this._handleStaleSession(text)
          } else {
            console.error('Chat provider error:', err)
            this._loadingSubject.next(false)
            this._cdr.markForCheck()
          }
        },
      })
  }
```

- [ ] **Step 2: Remove the transitional `await import('rxjs')` bridge**

That bridge from Task 7 is now replaced by the body above. Confirm no `await import('rxjs')` remains in `chat.component.ts`.

Run: `grep "await import" projects/ui-common/ai/chat/chat.component.ts || echo NONE`

Expected: `NONE`.

- [ ] **Step 3: Verify build**

Run: `npm run build:ui-common 2>&1 | tail -10`

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.ts
git commit -m "feat(ai): send flow rounds-trips sessionId + leaf id, dispatches stale recovery

_onMessageSent now passes the current sessionId + expectedLeafMessageId
through to provider.chat(), updates internal state from the response,
and emits sessionIdChange exactly once when a new session is created.
ChatSessionStaleError dispatches into _handleStaleSession (implemented
in the next commit). takeUntil(destroy\$) ensures HTTP is aborted on
component teardown."
```

---

### Task 10: Stale-leaf recovery + newSession()

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.ts`

- [ ] **Step 1: Add `_handleStaleSession` and `newSession`**

Add these methods to the class (place `newSession` as a public method near the top of the methods region; `_handleStaleSession` as a private helper near `_initialize`):

```ts
  /**
   * Resets the chat to a new empty session. Idempotent — safe to call when
   * the chat has no session loaded. Emits `(sessionIdChange)` with `null`.
   */
  newSession(): void {
    // Push EMPTY through the load pipeline so switchMap cancels any
    // in-flight session load before we clear state.
    this._sessionLoadRequest$.next(EMPTY)
    this._currentSessionId = null
    this._currentLeafMessageId = null
    this._messages = []
    this._displayMessages = []
    this._loadingSubject.next(false)
    this._initialLoadingSubject.next(false)
    this.sessionIdChange.emit(null)
    this._cdr.markForCheck()
  }

  private _handleStaleSession(originalText: string): void {
    const sessionId = this._currentSessionId
    if (!sessionId || !this._provider) {
      this._loadingSubject.next(false)
      this._cdr.markForCheck()
      return
    }
    this._provider
      .getSession(sessionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (reloaded) => {
          this._applySession(reloaded)
          this._chatInput?.restoreText(originalText)
          this._loadingSubject.next(false)
          this.staleSession.emit()
          this._cdr.markForCheck()
        },
        error: (reloadErr) => {
          console.error(
            'Chat session reload failed during stale-leaf recovery:',
            reloadErr,
          )
          this._chatInput?.restoreText(originalText)
          this._loadingSubject.next(false)
          this.staleSession.emit()
          this._cdr.markForCheck()
        },
      })
  }
```

- [ ] **Step 2: Verify build**

Run: `npm run build:ui-common 2>&1 | tail -10`

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.ts
git commit -m "feat(ai): seam-chat stale-leaf recovery and newSession() reset

_handleStaleSession reloads the session via provider.getSession,
restores the user's typed text to the input, and emits (staleSession)
for the app to toast. newSession() cancels in-flight loads via the
pipeline, clears state, and emits sessionIdChange(null)."
```

---

### Task 11: Template — initial-loading skeleton + empty state

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.html`

- [ ] **Step 1: Replace the template**

```html
<div class="seam-chat">
  <div class="seam-chat__messages" #messageList seamOverlayScrollbar>
    @if (initialLoading$ | async) {
      <div class="seam-chat__initial-loading">
        <span>Loading…</span>
      </div>
    } @else {
      @for (msg of _displayMessages; track $index) {
        <seam-chat-message [message]="msg"></seam-chat-message>
      }

      @if (loading$ | async) {
        <div class="seam-chat__loading">
          <span>Thinking...</span>
        </div>
      }
    }
  </div>

  <seam-chat-input
    [placeholder]="placeholder()"
    [disabled]="!!(loading$ | async) || !!(initialLoading$ | async)"
    (messageSent)="_onMessageSent($event)"
  ></seam-chat-input>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.html
git commit -m "feat(ai): seam-chat shows initial-loading skeleton; disables input during load"
```

---

### Task 12: Extend chat.component.spec.ts simulator + tests

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.component.spec.ts`

Grows the existing simulator pattern to mirror the new lifecycle and adds tests for each lifecycle branch.

- [ ] **Step 1: Replace `chat.component.spec.ts`**

```ts
import { firstValueFrom, Observable, of, throwError } from 'rxjs'

import {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from '../providers/ai-provider'
import { TheSeamChatContext } from '../chat-context'
import { TheSeamChatContextRegistry } from '../chat-context-registry.service'
import { parseChatResponse } from './chat-response-parser'

interface FakeProviderOptions {
  initial?: ChatSession | null
  byUid?: ReadonlyMap<string, ChatSession>
  errorOnFirstChat?: Error
}

class FakeAiProvider implements TheSeamAiProvider {
  lastRequest?: TheSeamAiChatRequest
  response = 'Test response'
  responseSessionId = 'session-new'
  responseLeaf = 'leaf-new'

  private _opts: FakeProviderOptions = {}
  private _errorOnNextChat?: Error

  constructor(opts: FakeProviderOptions = {}) {
    this._opts = opts
    this._errorOnNextChat = opts.errorOnFirstChat
  }

  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    this.lastRequest = request
    if (this._errorOnNextChat) {
      const err = this._errorOnNextChat
      this._errorOnNextChat = undefined
      return throwError(() => err)
    }
    return of({
      content: this.response,
      sessionId: request.sessionId ?? this.responseSessionId,
      label: 'Mock',
      leafMessageId: this.responseLeaf,
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return of(this._opts.initial ?? null)
  }

  getRecentSession(): Observable<ChatSession | null> {
    return of(this._opts.initial ?? null)
  }

  getSession(uid: string): Observable<ChatSession> {
    const s = this._opts.byUid?.get(uid)
    return s ? of(s) : throwError(() => new Error(`no session ${uid}`))
  }

  listSessions() { return of([]) }
  renameSession() { return of(undefined as void) }
  deleteSession() { return of(undefined as void) }
}

/**
 * Simulates TheSeamChatComponent's session lifecycle and send flow without
 * requiring Angular TestBed + Quill dependencies. The structure must match
 * the runtime component's behavior (see chat.component.ts).
 */
function makeSimulator(
  provider: FakeAiProvider,
  options: {
    initialSessionIdInput?: string | null
    registry?: TheSeamChatContextRegistry
    inputRef?: { restored: string | null }
  } = {},
) {
  const messages: ChatMessage[] = []
  const displayMessages: ReturnType<typeof toDisplay>[] = []
  const sessionIdEmissions: (string | null)[] = []
  const staleEmissions: number[] = []
  let currentSessionId: string | null = null
  let currentLeafMessageId: string | null = null

  function toDisplay(m: ChatMessage, ts: Date) {
    return {
      role: m.role,
      segments:
        m.role === 'assistant'
          ? parseChatResponse(m.content)
          : [{ type: 'markdown' as const, content: m.content }],
      timestamp: ts,
    }
  }

  function applySession(session: ChatSession) {
    const wasNoSession = currentSessionId === null
    currentSessionId = session.uid
    currentLeafMessageId = session.leafMessageId
    messages.length = 0
    displayMessages.length = 0
    for (const m of session.messages) {
      messages.push({ role: m.role, content: m.content })
      displayMessages.push(toDisplay({ role: m.role, content: m.content }, new Date(m.created)))
    }
    if (wasNoSession) sessionIdEmissions.push(session.uid)
  }

  async function init(initial: string | null | undefined) {
    if (initial) {
      const s = await firstValueFrom(provider.getSession(initial))
      applySession(s)
    } else {
      const s = await firstValueFrom(provider.getInitialSession())
      if (s) applySession(s)
    }
  }

  async function setSessionIdInput(next: string | null) {
    if (next === currentSessionId) return
    if (next === null) {
      currentSessionId = null
      currentLeafMessageId = null
      messages.length = 0
      displayMessages.length = 0
      sessionIdEmissions.push(null)
      return
    }
    const s = await firstValueFrom(provider.getSession(next))
    applySession(s)
  }

  function newSession() {
    currentSessionId = null
    currentLeafMessageId = null
    messages.length = 0
    displayMessages.length = 0
    sessionIdEmissions.push(null)
  }

  async function send(text: string) {
    messages.push({ role: 'user', content: text })
    displayMessages.push(toDisplay({ role: 'user', content: text }, new Date()))

    try {
      const response = await firstValueFrom(
        provider.chat({
          messages: [...messages],
          contexts: (await options.registry?.snapshot()) ?? undefined,
          sessionId: currentSessionId,
          expectedLeafMessageId: currentLeafMessageId,
        }),
      )
      messages.push({ role: 'assistant', content: response.content })
      displayMessages.push(toDisplay({ role: 'assistant', content: response.content }, new Date()))
      const wasNoSession = currentSessionId === null
      currentSessionId = response.sessionId
      currentLeafMessageId = response.leafMessageId
      if (wasNoSession) sessionIdEmissions.push(response.sessionId)
    } catch (err) {
      if (err instanceof ChatSessionStaleError) {
        const sessionId = currentSessionId
        if (sessionId) {
          try {
            const reloaded = await firstValueFrom(provider.getSession(sessionId))
            applySession(reloaded)
          } catch {
            /* reload failure: still restore + emit */
          }
        }
        if (options.inputRef) options.inputRef.restored = text
        staleEmissions.push(staleEmissions.length + 1)
      } else {
        throw err
      }
    }
  }

  return {
    messages,
    displayMessages,
    sessionIdEmissions,
    staleEmissions,
    getCurrentSessionId: () => currentSessionId,
    getCurrentLeafMessageId: () => currentLeafMessageId,
    init,
    setSessionIdInput,
    newSession,
    send,
  }
}

describe('TheSeamChatComponent (logic)', () => {
  it('starts empty when provider.getInitialSession returns null', async () => {
    const provider = new FakeAiProvider({ initial: null })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions).toEqual([])
  })

  it('populates from getInitialSession and emits sessionIdChange on first load', async () => {
    const session: ChatSession = {
      uid: 's1', label: 'l',
      created: '2026-05-13T00:00:00Z',
      lastActivity: '2026-05-13T00:00:00Z',
      leafMessageId: 'm2',
      messages: [
        { uid: 'm1', role: 'user', content: 'hi', created: '2026-05-13T00:00:00Z' },
        { uid: 'm2', role: 'assistant', content: 'hello', created: '2026-05-13T00:00:01Z' },
      ],
    }
    const provider = new FakeAiProvider({ initial: session })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toHaveLength(2)
    expect(sim.getCurrentSessionId()).toBe('s1')
    expect(sim.getCurrentLeafMessageId()).toBe('m2')
    expect(sim.sessionIdEmissions).toEqual(['s1'])
  })

  it('loads a specific session when sessionId input is a uid', async () => {
    const session: ChatSession = {
      uid: 'sX', label: 'X',
      created: '', lastActivity: '', leafMessageId: 'm1',
      messages: [{ uid: 'm1', role: 'user', content: 'q', created: '2026-05-13T00:00:00Z' }],
    }
    const provider = new FakeAiProvider({ byUid: new Map([['sX', session]]) })
    const sim = makeSimulator(provider)
    await sim.init('sX')
    expect(sim.getCurrentSessionId()).toBe('sX')
    expect(sim.messages).toHaveLength(1)
  })

  it('send round-trips sessionId and expectedLeafMessageId', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    // simulate prior session
    await sim.send('first')
    const sid = sim.getCurrentSessionId()
    const lid = sim.getCurrentLeafMessageId()
    expect(sid).toBeTruthy()
    expect(lid).toBeTruthy()

    provider.responseLeaf = 'leaf-2'
    await sim.send('second')

    expect(provider.lastRequest!.sessionId).toBe(sid)
    expect(provider.lastRequest!.expectedLeafMessageId).toBe(lid)
    expect(sim.getCurrentLeafMessageId()).toBe('leaf-2')
  })

  it('emits sessionIdChange exactly once when first send creates the session', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.sessionIdEmissions).toEqual([])
    await sim.send('hi')
    expect(sim.sessionIdEmissions).toHaveLength(1)
    await sim.send('again')
    expect(sim.sessionIdEmissions).toHaveLength(1)
  })

  it('handles stale-leaf by reloading, restoring text, and emitting staleSession', async () => {
    const reloaded: ChatSession = {
      uid: 's1', label: 'l',
      created: '', lastActivity: '', leafMessageId: 'm3',
      messages: [
        { uid: 'm1', role: 'user', content: 'a', created: '2026-05-13T00:00:00Z' },
        { uid: 'm2', role: 'assistant', content: 'b', created: '2026-05-13T00:00:01Z' },
        { uid: 'm3', role: 'user', content: 'c', created: '2026-05-13T00:00:02Z' },
      ],
    }
    const provider = new FakeAiProvider({
      initial: { uid: 's1', label: '', created: '', lastActivity: '', leafMessageId: 'm-old', messages: [] },
      byUid: new Map([['s1', reloaded]]),
      errorOnFirstChat: new ChatSessionStaleError('s1', 'm3'),
    })
    const inputRef = { restored: null as string | null }
    const sim = makeSimulator(provider, { inputRef })
    await sim.init(null)

    await sim.send('typed text')

    expect(inputRef.restored).toBe('typed text')
    expect(sim.staleEmissions).toHaveLength(1)
    expect(sim.messages).toHaveLength(reloaded.messages.length)
    expect(sim.getCurrentLeafMessageId()).toBe('m3')
  })

  it('setSessionIdInput to null after init resets the chat', async () => {
    const session: ChatSession = {
      uid: 's1', label: '',
      created: '', lastActivity: '', leafMessageId: 'm1',
      messages: [{ uid: 'm1', role: 'user', content: 'q', created: '2026-05-13T00:00:00Z' }],
    }
    const provider = new FakeAiProvider({ initial: session })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toHaveLength(1)

    await sim.setSessionIdInput(null)
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions[sim.sessionIdEmissions.length - 1]).toBeNull()
  })

  it('setSessionIdInput to a uid after init loads that session', async () => {
    const a: ChatSession = {
      uid: 'A', label: '',
      created: '', lastActivity: '', leafMessageId: 'a1',
      messages: [{ uid: 'a1', role: 'user', content: 'A', created: '2026-05-13T00:00:00Z' }],
    }
    const b: ChatSession = {
      uid: 'B', label: '',
      created: '', lastActivity: '', leafMessageId: 'b1',
      messages: [{ uid: 'b1', role: 'user', content: 'B', created: '2026-05-13T00:00:00Z' }],
    }
    const provider = new FakeAiProvider({
      initial: a,
      byUid: new Map([['A', a], ['B', b]]),
    })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.getCurrentSessionId()).toBe('A')

    await sim.setSessionIdInput('B')
    expect(sim.getCurrentSessionId()).toBe('B')
    expect(sim.messages[0].content).toBe('B')
  })

  it('newSession clears state and emits sessionIdChange(null)', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('a')
    expect(sim.getCurrentSessionId()).toBeTruthy()

    sim.newSession()
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions[sim.sessionIdEmissions.length - 1]).toBeNull()
  })

  it('forwards contexts when registry has entries', async () => {
    const registry = new TheSeamChatContextRegistry()
    const ctx: TheSeamChatContext = {
      type: 'datatable',
      getContext: () => ({ label: 'Bales' }),
    }
    registry.register(ctx)
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider, { registry })
    await sim.init(null)
    await sim.send('how many?')

    expect(provider.lastRequest!.contexts).toEqual([
      { type: 'datatable', data: { label: 'Bales' } },
    ])
  })

  it('omits the contexts field when no registry is provided', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('hi')
    expect(provider.lastRequest!.contexts).toBeUndefined()
  })

  it('parses assistant response into segments on send', async () => {
    const provider = new FakeAiProvider()
    provider.response = 'Hello **world**'
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('hi')
    expect(sim.displayMessages.at(-1)!.segments).toEqual([
      { type: 'markdown', content: 'Hello **world**' },
    ])
  })
})
```

- [ ] **Step 2: Run tests**

Run: `npm run test:ci -- --testPathPattern='chat.component.spec' 2>&1 | tail -20`

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.spec.ts
git commit -m "test(ai): cover session lifecycle, send round-trip, and stale recovery"
```

---

### Task 13: Storybook stories — WithInitialSession, StaleLeafRecovery, NewSessionFlow, SessionSwitch

**Files:**
- Modify: `projects/ui-common/ai/chat/chat.stories.ts`

Existing stories continue to work because they're providing `MockAiProvider('text')` which routes through the preserved legacy constructor.

- [ ] **Step 1: Add the new stories to `chat.stories.ts`**

First, add these to the existing import block at the top of the file (next to the other `@angular/core` and provider imports):

```ts
import { signal } from '@angular/core'
import { ChatSession, ChatSessionStaleError } from '../providers/ai-provider'
```

Then append the following at the bottom of `chat.stories.ts` (after the existing `ConversationHistory` export):

```ts
const _historySession: ChatSession = {
  uid: 'demo-session-1',
  label: 'Cotton bale conversation',
  created: '2026-05-13T08:00:00Z',
  lastActivity: '2026-05-13T08:00:30Z',
  leafMessageId: 'm2',
  messages: [
    {
      uid: 'm1',
      role: 'user',
      content: 'How many bales did we receive last week?',
      created: '2026-05-13T08:00:00Z',
    },
    {
      uid: 'm2',
      role: 'assistant',
      content:
        '777 bales were received across the three buying points. The North 40 led with 312 bales.',
      created: '2026-05-13T08:00:30Z',
    },
  ],
}

export const WithInitialSession: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'OK!',
            initialSession: _historySession,
            delayMs: 800,
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Continue the conversation...' },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })
    // The 800ms delay should be over by the time play runs; messages render.
    const messages = await harness.getMessages()
    await expect(messages).toHaveLength(2)
  },
}

export const StaleLeafRecovery: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'never gets sent — stale recovery replaces history',
            initialSession: _historySession,
            sessionsByUid: new Map([[
              _historySession.uid,
              {
                ..._historySession,
                leafMessageId: 'm3-from-other-tab',
                messages: [
                  ..._historySession.messages,
                  {
                    uid: 'm3-from-other-tab',
                    role: 'assistant',
                    content: 'Update from another tab: 778 bales (one was recounted).',
                    created: '2026-05-13T08:01:00Z',
                  },
                ],
              },
            ]]),
            throwOnFirstChat: new ChatSessionStaleError(
              _historySession.uid,
              'm3-from-other-tab',
            ),
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Try sending — server will report stale' },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })
    const input = await harness.getInput()
    // Manual play: open the story and click Send after typing. The history
    // should refresh and your text should reappear in the input.
    await expect(input).toBeTruthy()
  },
}

export const NewSessionFlow: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
        <button (click)="chat.newSession()" style="align-self: flex-start; padding: 4px 12px;">
          New Session
        </button>
        <seam-chat #chat [placeholder]="placeholder" style="flex: 1;"></seam-chat>
      </div>
    `,
  }),
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'OK',
            initialSession: _historySession,
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Say something or click New Session...' },
}

export const SessionSwitch: Story = {
  render: (args) => ({
    props: {
      ...args,
      sessionId: signal<string | null>(null),
      switchTo: (uid: string | null, sessionId: ReturnType<typeof signal<string | null>>) =>
        sessionId.set(uid),
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
        <div style="display: flex; gap: 8px;">
          <button (click)="switchTo('demo-session-1', sessionId)">Load A</button>
          <button (click)="switchTo('demo-session-2', sessionId)">Load B</button>
          <button (click)="switchTo(null, sessionId)">Clear</button>
        </div>
        <seam-chat [sessionId]="sessionId()" [placeholder]="placeholder" style="flex: 1;"></seam-chat>
      </div>
    `,
  }),
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: (() => {
            const a: ChatSession = { ..._historySession, uid: 'demo-session-1', label: 'A' }
            const b: ChatSession = {
              ..._historySession,
              uid: 'demo-session-2',
              label: 'B',
              messages: [{
                uid: 'b1', role: 'user',
                content: 'Different session content',
                created: '2026-05-13T08:00:00Z',
              }],
              leafMessageId: 'b1',
            }
            return new MockAiProvider({
              response: 'OK',
              sessionsByUid: new Map([
                ['demo-session-1', a],
                ['demo-session-2', b],
              ]),
            })
          })(),
        },
      ],
    }),
  ],
  args: { placeholder: 'Pick a session above...' },
}
```

- [ ] **Step 2: Run storybook build (catches story syntax errors without launching browser)**

Run: `npm run build-storybook 2>&1 | tail -20`

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat.stories.ts
git commit -m "docs(ai): add session-aware chat stories (initial load, stale, new, switch)"
```

---

### Task 14: Test harness additions

**Files:**
- Modify: `projects/ui-common/ai/chat/testing/chat.harness.ts`

- [ ] **Step 1: Add methods**

Replace `TheSeamChatHarness` with:

```ts
export class TheSeamChatHarness extends ComponentHarness {
  static hostSelector = 'seam-chat'

  private readonly _messages = this.locatorForAll(TheSeamChatMessageHarness)
  private readonly _input = this.locatorFor(TheSeamChatInputHarness)
  private readonly _loading = this.locatorForOptional('.seam-chat__loading')
  private readonly _initialLoading = this.locatorForOptional(
    '.seam-chat__initial-loading',
  )

  async getMessages(): Promise<TheSeamChatMessageHarness[]> {
    return this._messages()
  }

  async getMessageCount(): Promise<number> {
    return (await this._messages()).length
  }

  async getInput(): Promise<TheSeamChatInputHarness> {
    return this._input()
  }

  async isLoading(): Promise<boolean> {
    return (await this._loading()) !== null
  }

  async isInitialLoading(): Promise<boolean> {
    return (await this._initialLoading()) !== null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/testing/chat.harness.ts
git commit -m "test(ai): chat harness gains getMessageCount and isInitialLoading"
```

---

### Task 15: Public API exports

**Files:**
- Modify: `projects/ui-common/ai/public-api.ts`

- [ ] **Step 1: Replace `public-api.ts`**

```ts
// Shared providers
export {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  ChatSessionMessage,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './providers/ai-provider'
export { LmStudioAiProvider } from './providers/lm-studio.ai-provider'
export { OpenRouterAiProvider } from './providers/openrouter.ai-provider'
export {
  MockAiProvider,
  MockAiProviderConfig,
} from './providers/mock.ai-provider'

// Context registry
export { TheSeamChatContext, TheSeamChatContextPayload } from './chat-context'
export { TheSeamChatContextRegistry } from './chat-context-registry.service'
export {
  TheSeamDatatableChatContext,
  TheSeamDatatableChatContextOptions,
  TheSeamDatatableChatContextData,
} from './contexts/datatable-chat-context'

// Chat
export { TheSeamChatComponent } from './chat/chat.component'
export { THESEAM_CHAT_PROVIDER } from './chat/chat-provider'
export {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat/chat-block-registry'
export {
  ChatContentSegment,
  parseChatResponse,
} from './chat/chat-response-parser'
export { TheSeamChatHarness } from './chat/testing/chat.harness'

// Datatable prompter
export {
  THESEAM_DATATABLE_PROMPTER_PROVIDER,
  assistantPrompt,
  getUserPrompt,
  parseResponse,
} from './datatable-prompter/datatable-prompter-prompt-provider'
export { TheSeamDatatablePrompterComponent } from './datatable-prompter/datatable-prompter.component'
```

- [ ] **Step 2: Run final ui-common verification**

Run: `npm run lint 2>&1 | tail -10` — expected: no errors.
Run: `npm run test:ci -- --testPathPattern='ai/' 2>&1 | tail -20` — expected: all AI tests pass.
Run: `npm run build:ui-common 2>&1 | tail -10` — expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/public-api.ts
git commit -m "feat(ai): export session-aware types via ai public-api"
```

- [ ] **Step 4: Hand off for beta publish**

Tell the user: "ui-common Phase 1 complete on branch `marklb/ai-chat-component`. Ready for review and merge so the GitHub Action can publish a beta build."

---

## Phase 2: TheSeam.MerchantServices.App

> All paths in Phase 2 are relative to `c:\Users\mberry\dev_home\git\TheSeam.MerchantServices.App\`.
> Branch from `master`: `git checkout -b feature/markb/chat-session-frontend`.
> **Prerequisite:** the user has provided the new `@theseam/ui-common` beta version (e.g., `1.2.3-beta.45`).

---

### Task 16: Bump @theseam/ui-common to new beta

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the new beta**

Run (substitute the beta version the user provided):

```bash
npm install --save --legacy-peer-deps @theseam/ui-common@beta
```

- [ ] **Step 2: Verify**

Run: `npm ls @theseam/ui-common --legacy-peer-deps 2>&1 | head -3`

Expected: shows the new beta version.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: bump @theseam/ui-common to beta with session-aware chat"
```

---

### Task 17: ApiHttp.patch()

**Files:**
- Modify: `projects/api/src/lib/api-http.ts`

- [ ] **Step 1: Add `patch()` to ApiHttp**

Insert after the existing `delete()` method in `projects/api/src/lib/api-http.ts`:

```ts
  patch<T>(path: string, body: unknown): Observable<T> {
    return this._http.patch<T>(this._url(path), body, {
      headers: this._jsonHeaders,
    })
  }
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix . 2>&1 | tail -10` (or run the typecheck script the project uses)

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add projects/api/src/lib/api-http.ts
git commit -m "feat(api): add patch helper to ApiHttp"
```

---

### Task 18: Update chat DTOs

**Files:**
- Modify: `projects/api/src/lib/models/chat.ts`

- [ ] **Step 1: Replace `chat.ts`**

```ts
export interface ApiChatMessageDto {
  role: string
  content: string
}

export interface ApiChatContextDto {
  type: string
  data: unknown
}

export interface ApiChatRequestDto {
  messages: ApiChatMessageDto[]
  contexts?: ApiChatContextDto[]
  sessionId?: string | null
  expectedLeafMessageId?: string | null
}

export interface ApiChatResponseDto {
  content: string
  sessionId: string
  label: string
  leafMessageId: string
}

export interface ApiChatSessionMessageDto {
  uid: string
  role: string
  content: string
  created: string
}

export interface ApiChatSessionDto {
  uid: string
  label: string
  created: string
  lastActivity: string
  leafMessageId: string | null
  messages: ApiChatSessionMessageDto[]
}

export interface ApiChatSessionListItemDto {
  uid: string
  label: string
  created: string
  lastActivity: string
}

export interface ApiRenameChatSessionBody {
  label: string
}

export interface ApiChatSessionStaleErrorBody {
  error: 'session_stale'
  sessionId: string
  currentLeafMessageId: string | null
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/api/src/lib/models/chat.ts
git commit -m "feat(api): widen chat DTOs with session + leaf fields; add session DTOs"
```

---

### Task 19: ApiChatSessionService

**Files:**
- Create: `projects/api/src/lib/services/ai/api-chat-session.service.ts`
- Modify: `projects/api/src/public-api.ts`

- [ ] **Step 1: Create the service**

```ts
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'

import { ApiTempHttp } from '../../api-temp-http.service'
import {
  ApiChatSessionDto,
  ApiChatSessionListItemDto,
} from '../../models/chat'

@Injectable({ providedIn: 'root' })
export class ApiChatSessionService {
  private readonly _api = inject(ApiTempHttp)
  private readonly _BASE = 'ai/ChatSession'

  /** Backend returns 204 No Content when the user has no recent session. */
  recent(): Observable<ApiChatSessionDto | null> {
    return this._api.get<ApiChatSessionDto | null>(`${this._BASE}/recent`)
  }

  get(uid: string): Observable<ApiChatSessionDto> {
    return this._api.get<ApiChatSessionDto>(`${this._BASE}/${uid}`)
  }

  list(): Observable<ApiChatSessionListItemDto[]> {
    return this._api.get<ApiChatSessionListItemDto[]>(this._BASE)
  }

  rename(uid: string, label: string): Observable<void> {
    return this._api.patch<void>(`${this._BASE}/${uid}`, { label })
  }

  delete(uid: string): Observable<void> {
    return this._api.delete<void>(`${this._BASE}/${uid}`)
  }
}
```

- [ ] **Step 2: Export from `public-api.ts`**

The file uses `export *` per source file. The new DTOs in `chat.ts` are already picked up by the existing `export * from './lib/models/chat'`, so only the service needs a new line.

Add this line under the existing `export * from './lib/services/ai/api-chat.service'`:

```ts
export * from './lib/services/ai/api-chat-session.service'
```

- [ ] **Step 3: Verify build**

Run: `npx ng build api 2>&1 | tail -10`

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add projects/api/src/lib/services/ai/api-chat-session.service.ts projects/api/src/public-api.ts
git commit -m "feat(api): ApiChatSessionService — recent, get, list, rename, delete"
```

---

### Task 20: AppAiProvider — implement Observable-based session-aware provider

**Files:**
- Modify: `src/app/modules/chat/ai-provider.ts`
- Create: `src/app/modules/chat/ai-provider.spec.ts`

- [ ] **Step 1: Write failing spec for the pure helpers**

Create `src/app/modules/chat/ai-provider.spec.ts`:

```ts
import { HttpErrorResponse } from '@angular/common/http'

import { ChatSessionStaleError } from '@theseam/ui-common/ai'

import type {
  ApiChatSessionDto,
  ApiChatSessionStaleErrorBody,
} from '@lib/api'

import { mapChatError, mapSessionDto } from './ai-provider'

describe('AppAiProvider helpers', () => {
  describe('mapChatError', () => {
    it('converts a 409 session_stale HttpErrorResponse to ChatSessionStaleError', () => {
      const errBody: ApiChatSessionStaleErrorBody = {
        error: 'session_stale',
        sessionId: 's1',
        currentLeafMessageId: 'leaf-actual',
      }
      const httpErr = new HttpErrorResponse({ status: 409, error: errBody })
      const result = mapChatError(httpErr)
      expect(result).toBeInstanceOf(ChatSessionStaleError)
      expect((result as ChatSessionStaleError).sessionId).toBe('s1')
      expect((result as ChatSessionStaleError).currentLeafMessageId).toBe('leaf-actual')
    })

    it('passes other 409 errors through unchanged', () => {
      const httpErr = new HttpErrorResponse({ status: 409, error: { error: 'other' } })
      expect(mapChatError(httpErr)).toBe(httpErr)
    })

    it('passes non-HttpErrorResponse through unchanged', () => {
      const e = new Error('boom')
      expect(mapChatError(e)).toBe(e)
    })
  })

  describe('mapSessionDto', () => {
    it('passes through known roles without warnings', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
      const dto: ApiChatSessionDto = {
        uid: 's1', label: 'L',
        created: '2026-05-13T00:00:00Z',
        lastActivity: '2026-05-13T00:00:00Z',
        leafMessageId: 'm1',
        messages: [
          { uid: 'm1', role: 'user', content: 'hi', created: '2026-05-13T00:00:00Z' },
        ],
      }
      const result = mapSessionDto(dto)
      expect(result.messages).toHaveLength(1)
      expect(result.messages[0].role).toBe('user')
      warn.mockRestore()
    })

    it('warns in dev mode for unknown roles but still passes them through', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
      const dto: ApiChatSessionDto = {
        uid: 's1', label: 'L',
        created: '2026-05-13T00:00:00Z',
        lastActivity: '2026-05-13T00:00:00Z',
        leafMessageId: 'm1',
        messages: [
          { uid: 'm1', role: 'system', content: 'huh', created: '2026-05-13T00:00:00Z' },
        ],
      }
      const result = mapSessionDto(dto)
      expect(result.messages[0].role).toBe('system')
      // Note: isDevMode() returns true in jest unless explicitly disabled.
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })
  })
})
```

- [ ] **Step 2: Run failing test**

Run: `npx jest src/app/modules/chat/ai-provider.spec.ts 2>&1 | tail -20`

Expected: FAIL — `mapChatError` and `mapSessionDto` don't exist.

- [ ] **Step 3: Replace `ai-provider.ts`**

```ts
import { inject, isDevMode } from '@angular/core'
import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { catchError, map, Observable, throwError } from 'rxjs'

import {
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  ChatSessionMessage,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from '@theseam/ui-common/ai'

import {
  ApiChatContextDto,
  ApiChatService,
  ApiChatSessionDto,
  ApiChatSessionListItemDto,
  ApiChatSessionMessageDto,
  ApiChatSessionService,
  ApiChatSessionStaleErrorBody,
} from '@lib/api'

export class AppAiProvider implements TheSeamAiProvider {
  private readonly _chat = inject(ApiChatService)
  private readonly _session = inject(ApiChatSessionService)
  private readonly _route = inject(ActivatedRoute)

  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return this._chat
      .post({
        messages: request.messages,
        contexts: request.contexts as ApiChatContextDto[] | undefined,
        sessionId: request.sessionId ?? null,
        expectedLeafMessageId: request.expectedLeafMessageId ?? null,
      })
      .pipe(catchError((err) => throwError(() => mapChatError(err))))
  }

  getInitialSession(): Observable<ChatSession | null> {
    const idFromUrl = this._route.snapshot.queryParamMap.get('chatSession')
    if (idFromUrl) {
      return this._session.get(idFromUrl).pipe(
        map(mapSessionDto),
        // Unknown / deleted / belongs to another user — silently fall back.
        catchError(() => this.getRecentSession()),
      )
    }
    return this.getRecentSession()
  }

  getRecentSession(): Observable<ChatSession | null> {
    return this._session.recent().pipe(map((dto) => (dto ? mapSessionDto(dto) : null)))
  }

  getSession(uid: string): Observable<ChatSession> {
    return this._session.get(uid).pipe(map(mapSessionDto))
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return this._session.list().pipe(map((items) => items.map(mapListItemDto)))
  }

  renameSession(uid: string, label: string): Observable<void> {
    return this._session.rename(uid, label)
  }

  deleteSession(uid: string): Observable<void> {
    return this._session.delete(uid)
  }
}

export function mapChatError(err: unknown): unknown {
  if (
    err instanceof HttpErrorResponse &&
    err.status === 409 &&
    err.error?.error === 'session_stale'
  ) {
    const body = err.error as ApiChatSessionStaleErrorBody
    return new ChatSessionStaleError(body.sessionId, body.currentLeafMessageId)
  }
  return err
}

export function mapSessionDto(dto: ApiChatSessionDto): ChatSession {
  return {
    uid: dto.uid,
    label: dto.label,
    created: dto.created,
    lastActivity: dto.lastActivity,
    leafMessageId: dto.leafMessageId,
    messages: dto.messages.map(mapMessageDto),
  }
}

function mapMessageDto(dto: ApiChatSessionMessageDto): ChatSessionMessage {
  if (isDevMode() && dto.role !== 'user' && dto.role !== 'assistant') {
    // eslint-disable-next-line no-console
    console.warn(`AppAiProvider: unrecognized chat message role "${dto.role}"`)
  }
  return {
    uid: dto.uid,
    role: dto.role,
    content: dto.content,
    created: dto.created,
  }
}

function mapListItemDto(dto: ApiChatSessionListItemDto): ChatSessionListItem {
  return {
    uid: dto.uid,
    label: dto.label,
    created: dto.created,
    lastActivity: dto.lastActivity,
  }
}
```

- [ ] **Step 4: Run tests + verify build**

Run: `npx jest src/app/modules/chat/ai-provider.spec.ts 2>&1 | tail -20`

Expected: all 5 tests pass.

Run: `npx ng build app 2>&1 | tail -20`

Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/app/modules/chat/ai-provider.ts src/app/modules/chat/ai-provider.spec.ts
git commit -m "feat(chat): AppAiProvider implements session-aware Observable interface

Adds getInitialSession (URL chatSession= → getSession; else getRecent),
getRecentSession, getSession, listSessions, renameSession,
deleteSession. mapChatError translates 409 session_stale into
ChatSessionStaleError. mapSessionDto warns in dev for unknown roles
but passes them through."
```

---

### Task 21: Base-layout wiring — query-param signal, two-way binding, (staleSession)

**Files:**
- Modify: `src/app/modules/base-layout/components/base-layout/base-layout.component.ts`
- Modify: `src/app/modules/base-layout/components/base-layout/base-layout.component.html`

- [ ] **Step 1: Add chat session state to the component class**

In `base-layout.component.ts`, add these inputs to the existing inject section and new fields/methods to the class.

Add imports:

```ts
import { ToastrService } from 'ngx-toastr'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { distinctUntilChanged, map as rxMap } from 'rxjs/operators'
```

In the class, add fields (next to the existing `_chatVisible`):

```ts
  private readonly _toastr = inject(ToastrService)
  _chatSessionId = signal<string | null>(null)
```

Note: `signal` is already imported in many places in this codebase; if not, add `signal` to the `@angular/core` import block.

In the constructor (at the end of the existing constructor body), add:

```ts
    this._activatedRoute.queryParamMap
      .pipe(
        rxMap((m) => m.get('chatSession')),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((id) => {
        // Mirror the URL into the chat binding without looping: only update
        // when the value differs from what we have.
        if (this._chatSessionId() !== id) {
          this._chatSessionId.set(id)
        }
      })
```

Add a method:

```ts
  _onChatSessionIdChange(id: string | null) {
    if (this._chatSessionId() === id) return
    this._chatSessionId.set(id)
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { chatSession: id ?? null },
      queryParamsHandling: 'merge',
    })
  }

  _onStaleSession() {
    this._toastr.info(
      'This conversation was updated elsewhere — we refreshed it. Your message is restored to the input.',
      'Chat updated',
      { timeOut: 6000 },
    )
  }
```

- [ ] **Step 2: Update the template**

In `base-layout.component.html`, replace the existing `<seam-chat placeholder="Ask a question..."></seam-chat>` block with:

```html
<seam-chat
  #chat
  placeholder="Ask a question..."
  [sessionId]="_chatSessionId()"
  (sessionIdChange)="_onChatSessionIdChange($event)"
  (staleSession)="_onStaleSession()"
></seam-chat>
```

Optionally, add a "New Session" button next to the chat. The simplest placement is inside the same flex container right above the chat:

```html
@if (_chatVisible) {
  <div style="flex: 0 0 30%" class="mb-4 d-flex flex-column">
    <button
      seamButton
      theme="link"
      class="align-self-end mb-1"
      (click)="chat.newSession()"
    >
      New Session
    </button>
    <seam-chat
      #chat
      placeholder="Ask a question..."
      [sessionId]="_chatSessionId()"
      (sessionIdChange)="_onChatSessionIdChange($event)"
      (staleSession)="_onStaleSession()"
      style="flex: 1;"
    ></seam-chat>
  </div>
}
```

- [ ] **Step 3: Verify build**

Run: `npx ng build app 2>&1 | tail -10`

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/app/modules/base-layout/components/base-layout/base-layout.component.ts src/app/modules/base-layout/components/base-layout/base-layout.component.html
git commit -m "feat(app): wire base-layout chat to chatSession query param + stale toast

Two-way binding [sessionId]/(sessionIdChange) syncs to ?chatSession=
via Router.navigate(queryParamsHandling: 'merge'). (staleSession)
fires a ngx-toastr info toast. Adds a 'New Session' button above the
chat that calls chat.newSession() via #chat template ref."
```

---

### Task 22: Browser smoke test

No file changes. Verify end-to-end behavior before opening the PR.

- [ ] **Step 1: Start dev server**

Run: `npm start` (or whatever the project's dev-server command is — check `package.json` scripts; `start` is the conventional name).

- [ ] **Step 2: Smoke checklist**

Open the app in the browser, sign in, then run through these steps. Each one should match the described outcome before moving to the next.

1. **Toggle chat panel** — click the "AI" button. Chat sidebar appears. URL has no `chatSession` param.
2. **First send** — type "What's the cotton price?" and press Send. After response, the URL gains `?chatSession=<some-uid>` (sync via `(sessionIdChange)`). Both messages render.
3. **Refresh** — reload the page. The chat sidebar reopens to the same conversation; the user and assistant messages are restored from history.
4. **Send a follow-up** — confirm the new turn appends correctly and that the next backend response keeps the same `sessionId` in the URL.
5. **Stale-leaf** — open the same app in a second browser tab. Send a message there to advance the leaf. Switch back to the first tab, type a new message, and Send. Toast appears, history refreshes, your typed text is restored to the input.
6. **New Session button** — click "New Session". Chat clears, URL drops the `chatSession` param.
7. **Send after new session** — type and send. URL gains a new `chatSession=` value (different from before).
8. **Manual URL navigation** — click the browser back button. URL goes back to the prior `chatSession`. Chat loads that prior conversation.

- [ ] **Step 3: If anything fails, capture the symptom**

Diagnose and fix before opening the PR. Re-run the checklist after each fix.

- [ ] **Step 4: Open the PR**

Push the branch and open a PR titled `feat(chat): session persistence frontend` with the smoke-test checklist in the PR body, plus a note that this consumes the new `@theseam/ui-common@<beta-version>`.

---

## Notes on conventions used

- **ui-common (Phase 1):** prettier defaults (2-space, no semicolons, single quotes, trailing commas); `_`-prefixed privates; `readonly` injected fields; signal inputs and `output()`; `@if`/`@for`. ESLint `no-console` is "warn" — `console.error` / `console.warn` lines will lint-warn but don't block.
- **app (Phase 2):** follows whatever convention the merchant services app already uses (visible from existing files — keep consistent).
- **Commits:** conventional commits; `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Breaking changes use `feat!:` or `fix!:`. The Phase 1 ui-common provider change is breaking (existing implementations need updating), hence `feat(ai)!` in Task 1.
- **Frequent commits:** each task commits at completion; subagent-driven execution makes this even more granular if desired.

## Out of scope (deferred)

These are explicitly out of scope for this plan; do not implement them:
- Session list / sidebar UI in ui-common.
- Renaming or deleting the current session from inside the chat component.
- Datatable-prompter migration to the new interface.
- Streaming responses.
- Branching / edit / retry flows.
- Reactive `getInitialSession()` re-fires on URL change after mount.
