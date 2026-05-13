# Design: AI Chat Session Persistence — Frontend

**Date:** 2026-05-13
**Status:** Draft
**Scope:** Update `ui-common` chat component + shared provider interface; update the merchant services app's API lib and `AppAiProvider` to consume the new endpoints. Companion to the backend spec at `TheSeam.MerchantServices/docs/superpowers/specs/2026-05-11-chat-persistence-design.md`.

## Goal

Make the existing `seam-chat` component session-aware: load a user's prior conversation on mount, persist new turns through the existing chat send endpoint (now carrying `sessionId` and `expectedLeafMessageId`), and round-trip the resulting session uid so it survives page refresh. The chat component owns the loading lifecycle; the `TheSeamAiProvider` interface grows the full session surface (read + rename + delete) so the upcoming sidebar work doesn't need a second library publish.

**Demonstrable bar:** the user opens the chat sidebar, sees prior messages from the most recent session, sends a new message, refreshes the page, and continues the same conversation. A second tab open on the same session that sends a message in the background causes the first tab's next send to receive a 409, restore the user's typed text to the input, reload the conversation, and emit a `(staleSession)` event the app can toast.

## Non-Goals

- **Session list / sidebar UI.** `listSessions()` lives on the provider so the app can prototype a list externally, but the polished list component is deferred to a separate ui-common task.
- **Rename / delete from inside the chat component.** Methods exist on the provider; UI for them ships with the sidebar work.
- **Datatable-prompter migration.** It doesn't use sessions today and the user is reshaping it separately.
- **Reactive `getInitialSession()` re-fires on URL change.** A consuming app can subscribe to its own URL signal and push into the `sessionId` input; the provider itself reads `queryParamMap.snapshot` once when the chat component mounts.
- **Streaming responses.** Same posture as the backend spec.
- **Branching / edit / retry.** Backend schema supports it; no UI surfaced.
- **`ApiChatService` regeneration.** No code generator is in play; DTOs are hand-maintained.

## Approach

Three coordinated changes:

1. **`TheSeamAiProvider` interface (ui-common)** — gains a session surface (`getInitialSession`, `getRecentSession`, `getSession`, `listSessions`, `renameSession`, `deleteSession`). The existing `chat()` request widens to carry `sessionId` and `expectedLeafMessageId`; the response widens to return `sessionId`, `label`, and `leafMessageId`. A new `ChatSessionStaleError` class surfaces the 409 in a transport-agnostic way.

2. **`TheSeamChatComponent` (ui-common)** — migrated to signal inputs / `output()` / control-flow blocks in the same pass. Gains `sessionId` input, `sessionIdChange` and `staleSession` outputs, and a public `newSession()` method. Lifecycle handles initial load, input-driven session navigation, stale-leaf recovery, and in-flight cancellation via `switchMap` over an Observable-based provider interface.

3. **App API + provider (merchant services app)** — `ApiChatSessionService` added; chat DTOs widened; `ApiHttp` gains a `patch()` helper; `AppAiProvider` implements the new interface, including `getInitialSession()` that prefers `?chatSession=<uid>` over `getRecentSession()` and translates `HttpErrorResponse` 409 into `ChatSessionStaleError`.

### Key design choices

- **Provider owns the "where does the initial session come from" policy.** `getInitialSession()` is a hook; the default app implementation checks `?chatSession=<uid>` then falls back to recent. Apps that want different behavior provide their own `TheSeamAiProvider` at the component level via Angular hierarchical DI.

- **Chat component is the source of truth for the active session.** It tracks `_currentSessionId` and `_currentLeafMessageId` internally; `sessionId` input is a write-only port (apps push) and `sessionIdChange` is a read-only port (apps observe). Apps pairing them with `[(sessionId)]` get URL-sync for free.

- **Asymmetric `null` semantics on `sessionId` input.** At init, `null` triggers `getInitialSession()`. After init, `null` resets to a new empty chat. Documented on the input's JSDoc; justified because init is a one-shot "what should I show?" moment while runtime changes are commands.

- **`newSession()` as the imperative reset.** Apps call `chat.newSession()` via `#chat` template ref (component instance auto-exposed; no `exportAs` needed). Same effect as setting the bound input to null after init — both supported.

- **Stale-leaf recovery: restore + reload + emit.** The chat component reloads the session, restores the user's typed text via `SeamChatInputComponent.restoreText()`, and emits `staleSession`. The app surfaces a toast (library stays presentation-agnostic).

- **In-flight cancellation via `switchMap`.** Session loads run through a single `Subject<Observable<ChatSession | null>>` piped through `switchMap` — a new load unsubscribes the previous, which aborts the underlying `HttpClient` request when the provider is backed by HTTP. `takeUntil(this._destroy$)` on every subscription handles unmount.

## Architecture

```text
Consuming app (TheSeam.MerchantServices.App)
  ├─ AppAiProvider implements TheSeamAiProvider
  │    ├─ chat()              → ApiChatService.post()         (+ 409 → ChatSessionStaleError)
  │    ├─ getInitialSession() → checks ?chatSession= → getSession(uid) || getRecentSession()
  │    ├─ getRecentSession()  → ApiChatSessionService.recent()  (204 → null)
  │    ├─ getSession(uid)     → ApiChatSessionService.get(uid)
  │    ├─ listSessions()      → ApiChatSessionService.list()
  │    ├─ renameSession()     → ApiChatSessionService.rename(uid, label)
  │    └─ deleteSession()     → ApiChatSessionService.delete(uid)
  │
  ├─ base-layout wires <seam-chat [(sessionId)]="urlSession" (staleSession)="toast()" #chat>
  └─ "New Session" button (optional, where chosen) → chat.newSession()

ui-common library
  └─ seam-chat
       ├─ on mount: provider.getInitialSession() | provider.getSession(sessionId)
       ├─ on input change: provider.getSession(newId)  (null → reset, post-init)
       ├─ on send: provider.chat({ ..., sessionId, expectedLeafMessageId })
       │     ├─ success → push assistant msg, update leaf, emit sessionIdChange if new
       │     └─ ChatSessionStaleError → reload session, restoreText, emit staleSession
       └─ newSession() → clear state, emit sessionIdChange(null)
```

## Provider Interface

### File: `projects/ui-common/ai/providers/ai-provider.ts`

```ts
import { TheSeamChatContextPayload } from '../chat-context'

/**
 * A single conversation turn. Sent to the LLM via `chat()` and produced by
 * `chat()` as the assistant response. Persisted history (with uid + created)
 * is exposed separately via `ChatSessionMessage`.
 */
export interface ChatMessage {
  role: string   // 'user' | 'assistant' in practice; widened for forward-compat
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
 * Thrown by `TheSeamAiProvider.chat()` when the server reports the session's
 * leaf has advanced since the client last observed it (HTTP 409).
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
   * Implementations should emit exactly once and complete (the chat component
   * subscribes per-send and relies on completion to clear loading state).
   */
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse>

  /**
   * Hook for the chat component to ask the provider what session to load on
   * mount. The default app implementation prefers a query-param session uid
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

### Non-API providers

`MockAiProvider`, `LmStudioAiProvider`, and `OpenRouterAiProvider` stay in the same file structure but implement the wider interface. The fetch-based providers wrap their `fetch` calls with `defer(() => from(fetch(...)))` so they participate in the cancellation chain (a superseded load actually aborts via the underlying `AbortController`; the legacy implementations can adopt this incrementally). The OpenAI-style providers don't speak the persistence API; their session methods return `throwError(() => new Error('Not supported'))` and `getInitialSession()` returns `of(null)`. The chat component handles this gracefully — storybook stories targeting these providers keep working, they just don't pre-load any history.

### `MockAiProvider` upgrade

```ts
export interface MockAiProviderConfig {
  response?: string | ((messages: ChatMessage[]) => string)
  initialSession?: ChatSession | null
  sessionsByUid?: ReadonlyMap<string, ChatSession>
  sessionsList?: ChatSessionListItem[]

  /** First chat() call errors with this; subsequent calls succeed normally. */
  throwOnFirstChat?: Error

  /** Artificial delay (ms) applied uniformly. Overridable per method. */
  delayMs?: number
  delayMsByMethod?: Partial<Record<keyof TheSeamAiProvider, number>>
}

export class MockAiProvider implements TheSeamAiProvider {
  constructor(config?: MockAiProviderConfig | string | ((m: ChatMessage[]) => string)) { ... }
  // Legacy positional-string constructor preserved for existing stories/tests.
}
```

Method implementations use `defer(() => of(value).pipe(delay(this._delayFor('chat'))))` so artificial delay is honored on every subscribe, the source is cold (resubscription replays), and unsubscription mid-delay cancels the pending emission. The delay support lets stories demonstrate the loading skeleton, in-flight send disabled state, and post-stale-recovery flow.

## Chat Component

### File: `projects/ui-common/ai/chat/chat.component.ts`

Migrated to signals + control-flow blocks in this same pass (matches the user's intended direction; `seam-chat-message` and `seam-chat-input` stay on the older pattern unless touched for unrelated reasons).

```ts
@Component({
  selector: 'seam-chat',
  imports: [
    SeamChatMessageComponent,
    SeamChatInputComponent,
    TheSeamOverlayScrollbarDirective,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamChatComponent implements OnInit, OnDestroy {
  private readonly _provider = inject(THESEAM_CHAT_PROVIDER, { optional: true })
  private readonly _chatContextRegistry = inject(TheSeamChatContextRegistry, { optional: true })
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _ngZone = inject(NgZone)

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

  // Internal state
  private _currentSessionId: string | null = null
  private _currentLeafMessageId: string | null = null
  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []   // template-bound
  private _initialized = false

  // Drives the load pipeline. switchMap on this subject cancels any
  // in-flight session load when a new one is requested.
  private readonly _sessionLoadRequest$ = new Subject<Observable<ChatSession | null>>()
  private readonly _destroy$ = new Subject<void>()

  private readonly _loadingSubject = new BehaviorSubject<boolean>(false)
  private readonly _initialLoadingSubject = new BehaviorSubject<boolean>(false)
  readonly loading$ = this._loadingSubject.asObservable()
  readonly initialLoading$ = this._initialLoadingSubject.asObservable()

  constructor() {
    this._sessionLoadRequest$.pipe(
      tap(() => this._initialLoadingSubject.next(this._messages.length === 0)),
      switchMap(load$ => load$.pipe(
        catchError(err => {
          console.error('Chat session load failed:', err)
          return of(null)
        }),
      )),
      takeUntil(this._destroy$),
    ).subscribe(session => {
      this._initialLoadingSubject.next(false)
      if (session) {
        this._applySession(session)
        this._cdr.markForCheck()
      }
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

  ngOnInit() { /* scrollbar hookup, unchanged */ }

  ngOnDestroy() {
    this._destroy$.next()
    this._destroy$.complete()
  }

  /**
   * Resets the chat to a new empty session. Idempotent — safe to call when
   * the chat has no session loaded. Emits `(sessionIdChange)` with `null`.
   */
  newSession(): void {
    // Push a no-op observable through the pipeline so switchMap cancels any
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

  // private helpers — _initialize, _reactToSessionInputChange,
  // _applySession, _onMessageSent, _handleStaleSession, etc.
}
```

### Display message model

```ts
export interface ChatMessageDisplayModel {
  /** Present for messages loaded from a persisted session. */
  uid?: string
  role: string
  segments: ChatContentSegment[]
  timestamp: Date
}
```

Loaded messages get `uid` populated from the DTO; live-sent messages omit it (we don't know the uid until the server assigns one, and we don't need it for in-memory state in v1).

### Template (control-flow blocks)

```html
<div class="seam-chat" seamOverlayScrollbar>
  <div #messageList class="seam-chat-messages">
    @if (initialLoading$ | async) {
      <div class="seam-chat-initial-loading">Loading…</div>
    } @else if (_displayMessages.length === 0) {
      <!-- empty state -->
    } @else {
      @for (msg of _displayMessages; track $index) {
        <seam-chat-message [message]="msg" />
      }
    }
  </div>
  <seam-chat-input
    [placeholder]="placeholder()"
    [disabled]="(loading$ | async) || (initialLoading$ | async)"
    (messageSent)="_onMessageSent($event)"
  />
</div>
```

### Lifecycle

The session-load pipeline (in `constructor()`) is one `switchMap` over a `Subject<Observable<ChatSession | null>>`. Each entry to the pipeline cancels the previous via `switchMap`'s unsubscribe — if the previous emission was an `HttpClient` observable, the underlying `XMLHttpRequest` aborts. Errors are caught per-emission via `catchError` so a failed load doesn't terminate the pipeline.

**First init** (effect's first read):

1. Set `_initialized = true` synchronously, before pushing to the load pipeline. Prevents the effect from re-entering `_initialize` if `sessionId` changes during the load.
2. If `incoming` is a string → push `provider.getSession(incoming)` to `_sessionLoadRequest$`.
3. Else → push `provider.getInitialSession()`. When it resolves to a non-null session, `_applySession` runs and the load-pipeline subscriber additionally emits `sessionIdChange(session.uid)` (only when `_currentSessionId` was previously null, so initial-load emissions distinguish from re-load emissions).

**After init**, on `sessionId` input change:

1. If `incoming === _currentSessionId` → no-op.
2. If `incoming` is a string → push `provider.getSession(incoming)`. The load-pipeline subscriber emits `sessionIdChange(incoming)` after `_applySession` (round-trip safety; harmless for two-way binding because Angular dedupes by reference).
3. If `incoming` is null → call `newSession()` (clears state, emits, and pushes `EMPTY` through the pipeline to cancel any in-flight load).

**`_applySession`:**

```ts
private _applySession(session: ChatSession) {
  this._currentSessionId = session.uid
  this._currentLeafMessageId = session.leafMessageId
  this._messages = session.messages.map(m => ({ role: m.role, content: m.content }))
  this._displayMessages = session.messages.map(m => ({
    uid: m.uid,
    role: m.role,
    segments: m.role === 'assistant'
      ? parseChatResponse(m.content)
      : [{ type: 'markdown', content: m.content }],
    timestamp: new Date(m.created),
  }))
}
```

Note: the load-pipeline subscriber emits `sessionIdChange` (when applicable) rather than `_applySession` itself, so the emission rule lives in the subscriber where it can read the prior `_currentSessionId` before `_applySession` overwrites it.

### Send flow (`_onMessageSent`)

```ts
_onMessageSent(text: string) {
  if (this._loadingSubject.value) return
  if (!this._provider) {
    console.error('No chat provider configured.')
    return
  }

  const userMessage: ChatMessage = { role: 'user', content: text }
  this._messages.push(userMessage)
  this._displayMessages = [
    ...this._displayMessages,
    { role: 'user', segments: [{ type: 'markdown', content: text }], timestamp: new Date() },
  ]
  this._loadingSubject.next(true)
  this._cdr.markForCheck()

  from(this._chatContextRegistry?.snapshot() ?? Promise.resolve([])).pipe(
    switchMap(contexts => this._provider!.chat({
      messages: this._messages,
      contexts: contexts.length === 0 ? undefined : contexts,
      sessionId: this._currentSessionId,
      expectedLeafMessageId: this._currentLeafMessageId,
    })),
    takeUntil(this._destroy$),
  ).subscribe({
    next: response => {
      this._messages.push({ role: 'assistant', content: response.content })
      this._displayMessages = [
        ...this._displayMessages,
        { role: 'assistant', segments: parseChatResponse(response.content), timestamp: new Date() },
      ]
      const newSession = this._currentSessionId === null
      this._currentSessionId = response.sessionId
      this._currentLeafMessageId = response.leafMessageId
      if (newSession) this.sessionIdChange.emit(response.sessionId)
      this._loadingSubject.next(false)
      this._cdr.markForCheck()
    },
    error: err => {
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

private _handleStaleSession(originalText: string) {
  const sessionId = this._currentSessionId
  if (!sessionId || !this._provider) {
    this._loadingSubject.next(false)
    return
  }
  this._provider.getSession(sessionId).pipe(
    takeUntil(this._destroy$),
  ).subscribe({
    next: reloaded => {
      this._applySession(reloaded)
      this._chatInput?.restoreText(originalText)
      this._loadingSubject.next(false)
      this.staleSession.emit()
      this._cdr.markForCheck()
    },
    error: reloadErr => {
      console.error('Chat session reload failed during stale-leaf recovery:', reloadErr)
      this._chatInput?.restoreText(originalText)
      this._loadingSubject.next(false)
      this.staleSession.emit()
      this._cdr.markForCheck()
    },
  })
}
```

Note on lifecycle isolation: `takeUntil(this._destroy$)` on every subscription guarantees that a destroyed component drops in-flight HTTP without applying late callbacks. The send subscription is per-call (not held in a property), so a double-click on Send is gated by the `_loadingSubject.value` check at the top — no need to `switchMap` over send attempts.

### `SeamChatInputComponent` additions

A single public method for parent-driven text restoration:

```ts
/** Restores the given text into the input control. */
restoreText(text: string): void {
  this._control.setValue(text)
}
```

## App API + Provider

### `ApiHttp` change

File: `projects/api/src/lib/api-http.ts`. Add `patch()` mirroring `put`/`post`:

```ts
patch<T>(path: string, body: unknown): Observable<T> {
  return this._http.patch<T>(this._url(path), body, {
    headers: this._jsonHeaders,
  })
}
```

No other `ApiHttp` changes. The 204-No-Content path on `recent()` uses Angular's existing `HttpClient.get<T>` behavior — a 204 with JSON `responseType` resolves to `null`, so widening the type parameter to `T | null` is sufficient.

### DTO additions

File: `projects/api/src/lib/models/chat.ts`. Widens `ApiChatRequestDto` / `ApiChatResponseDto` and adds the session DTOs.

```ts
export interface ApiChatMessageDto { role: string; content: string }
export interface ApiChatContextDto { type: string; data: unknown }

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

export interface ApiRenameChatSessionBody { label: string }

export interface ApiChatSessionStaleErrorBody {
  error: 'session_stale'
  sessionId: string
  currentLeafMessageId: string | null
}
```

### New service

File: `projects/api/src/lib/services/ai/api-chat-session.service.ts`.

```ts
@Injectable({ providedIn: 'root' })
export class ApiChatSessionService {
  private readonly _api = inject(ApiTempHttp)
  private readonly _BASE = 'ai/ChatSession'

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

Exported via `projects/api/src/public-api.ts` alongside the existing `ApiChatService`.

### `AppAiProvider` update

File: `src/app/modules/chat/ai-provider.ts`.

```ts
export class AppAiProvider implements TheSeamAiProvider {
  private readonly _chat = inject(ApiChatService)
  private readonly _session = inject(ApiChatSessionService)
  private readonly _route = inject(ActivatedRoute)

  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return this._chat.post({
      messages: request.messages,
      contexts: request.contexts as ApiChatContextDto[] | undefined,
      sessionId: request.sessionId ?? null,
      expectedLeafMessageId: request.expectedLeafMessageId ?? null,
    }).pipe(catchError(err => throwError(() => mapChatError(err))))
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
    return this._session.recent().pipe(map(dto => dto ? mapSessionDto(dto) : null))
  }

  getSession(uid: string): Observable<ChatSession> {
    return this._session.get(uid).pipe(map(mapSessionDto))
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return this._session.list().pipe(map(items => items.map(mapListItemDto)))
  }

  renameSession(uid: string, label: string): Observable<void> {
    return this._session.rename(uid, label)
  }

  deleteSession(uid: string): Observable<void> {
    return this._session.delete(uid)
  }
}

function mapChatError(err: unknown): unknown {
  if (err instanceof HttpErrorResponse
      && err.status === 409
      && err.error?.error === 'session_stale') {
    const body = err.error as ApiChatSessionStaleErrorBody
    return new ChatSessionStaleError(body.sessionId, body.currentLeafMessageId)
  }
  return err
}

function mapSessionDto(dto: ApiChatSessionDto): ChatSession {
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
    console.warn(`Unrecognized chat message role: "${dto.role}"`)
  }
  return { uid: dto.uid, role: dto.role, content: dto.content, created: dto.created }
}

function mapListItemDto(dto: ApiChatSessionListItemDto): ChatSessionListItem {
  return { uid: dto.uid, label: dto.label, created: dto.created, lastActivity: dto.lastActivity }
}
```

### `base-layout` wiring

The existing `<seam-chat placeholder="Ask a question...">` becomes:

```html
<seam-chat
  #chat
  placeholder="Ask a question..."
  [(sessionId)]="_chatSessionId"
  (staleSession)="_onStaleSession()"
/>
```

The component class:

- Adds a `_chatSessionId = signal<string | null>(null)` synchronized to the `?chatSession=` query param via a router subscription.
- On `sessionIdChange` (via two-way binding update), navigates with `Router.navigate([], { queryParams: { chatSession: id }, queryParamsHandling: 'merge' })` to keep URL in sync.
- `_onStaleSession()` calls `toastr.info(...)`.

Adding a "New Session" button (top-bar or chat header) is in scope to demonstrate the imperative path:

```html
<button (click)="chat.newSession()">New Session</button>
```

Placement is a minor product decision; if you don't have a clear spot, the simplest is a small button at the top of the chat sidebar area, sitting outside `<seam-chat>` but inside the chat container.

## Public API

Exports added to `projects/ui-common/ai/public-api.ts`:

```ts
export {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionMessage,
  ChatSessionListItem,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './providers/ai-provider'
```

Existing exports are preserved. `MockAiProviderConfig` is exported alongside `MockAiProvider`.

## Testing

### Unit specs

**`chat.component.spec.ts`** — extends the existing `makeSimulator()` pattern (TestBed + Quill is too heavy). The simulator mirrors the new lifecycle:

- **Initial load**: `sessionId=null` calls `getInitialSession()`; result populates messages and emits `sessionIdChange`; null result leaves chat empty.
- **Initial load with uid**: `sessionId='<uid>'` calls `getSession(uid)` directly.
- **Input change after init**: string → `getSession()` and replace; null → reset (no provider call); same value → no-op.
- **Send wires session/leaf**: request payload includes `sessionId` and `expectedLeafMessageId` from internal state.
- **Send response updates state**: assistant message appended; `_currentSessionId` and `_currentLeafMessageId` updated from response.
- **First send creates session**: starts with `_currentSessionId=null`; response carries one; `sessionIdChange` emits exactly once.
- **Stale-leaf recovery**: provider's `chat()` errors with `ChatSessionStaleError` → simulator verifies `getSession()` is called, state is replaced, `restoreText` is invoked with the original text, `staleSession` emits.
- **In-flight cancellation**: rapid `sessionId` change pushes two requests through the load pipeline; the harness asserts that an `HttpClient` test request for the first uid is cancelled (or for `MockAiProvider`, that its `defer`-based source is unsubscribed before its delay elapses).
- **`newSession()`**: clears messages/leaf/session and emits `sessionIdChange(null)`; cancels any in-flight load via the pipeline.

**`mock-ai-provider.spec.ts`** (new) — `delayMs` honored; `throwOnFirstChat` fires once then clears; `initialSession` returned by `getInitialSession()`.

**`ai-provider.spec.ts`** (new) — `mapChatError` recognizes 409 + `session_stale` and produces a `ChatSessionStaleError`; passes other errors through. `mapSessionDto` and `mapMessageDto` produce a dev-mode warning on unknown roles but still pass the message through.

### Storybook stories

`chat.stories.ts` gains:

| Story | Demonstrates |
| --- | --- |
| **BasicChat** (existing) | No initial session, send works. Mock returns `null` from `getInitialSession()`. |
| **WithInitialSession** | Mock returns a 3-message session from `getInitialSession()`; chat renders history on mount. `delayMs: 800` so the loading skeleton is visible. |
| **StaleLeafRecovery** | Mock's `chat()` errors with `ChatSessionStaleError` once; subsequent `getSession()` returns the updated session. Play function sends a message, asserts the message list reloads and the input text is restored. |
| **NewSessionFlow** | Renders the chat + a "New Session" button using `#chat` template ref. Play function sends → clicks button → asserts empty. |
| **SessionSwitch** | Renders the chat + two buttons that set `[sessionId]` to different uids. Play function clicks each and asserts the message list changes. |

### Test harness

`TheSeamChatHarness` gains:

- `isInitialLoading(): Promise<boolean>`
- `getMessageCount(): Promise<number>` (already conceptually present; harden if needed)
- `getInputText(): Promise<string>`

## Implementation Sequencing

**ui-common (single PR, in order):**

1. `ai/providers/ai-provider.ts` — interface, types, `ChatSessionStaleError`.
2. `ai/providers/mock.ai-provider.ts` — implement full interface; delay support; back-compat constructor.
3. `ai/providers/lm-studio.ai-provider.ts`, `ai/providers/openrouter.ai-provider.ts` — session methods throw / return null.
4. `ai/chat/chat-input.component.ts` — add `restoreText()`.
5. `ai/chat/chat.component.ts` — migrate to signals/control flow; add state, lifecycle, send flow, stale-leaf recovery, newSession.
6. `ai/chat/chat.component.html` — control-flow blocks.
7. `ai/chat/chat.component.spec.ts` — extend simulator and add new tests.
8. `ai/chat/chat.stories.ts` — update existing + add new stories.
9. `ai/chat/testing/chat.harness.ts` — new methods.
10. `ai/public-api.ts` — export new symbols.
11. Verify `ng test`, `ng build`, `storybook`.

Commit and hand back; release pipeline publishes the beta tag.

**TheSeam.MerchantServices.App (after consuming new beta):**

1. Bump `@theseam/ui-common` dependency.
2. `projects/api/src/lib/api-http.ts` — add `patch()`.
3. `projects/api/src/lib/models/chat.ts` — widen + add session DTOs.
4. `projects/api/src/lib/services/ai/api-chat-session.service.ts` — new service.
5. `projects/api/src/public-api.ts` — export the new service + DTOs.
6. `src/app/modules/chat/ai-provider.ts` — implement new interface; URL-aware `getInitialSession()`; 409 mapping.
7. `src/app/modules/base-layout/.../base-layout.component.{ts,html}` — wire `[(sessionId)]`, `(staleSession)`, optional "New Session" button. Sync `?chatSession=` query param.
8. Browser smoke test: send → refresh → resume → multi-tab stale-leaf.

## Failure modes

- **`getInitialSession()` errors.** `catchError` in the load pipeline logs and emits `null`; chat stays empty. User can still type; first send creates a new session.
- **`getSession(uid)` errors on navigation.** Same — logged, chat keeps previous state. Future enhancement: surface an `(loadError)` output if it becomes useful.
- **Stale-leaf reload errors.** Logged; user text still restored; `staleSession` still emits. App can offer a manual retry.
- **Cancelled load.** `switchMap` unsubscribes from the previous observable; for `HttpClient` sources, this aborts the request. No side effects from the cancelled load are applied.
- **Provider not configured (`THESEAM_CHAT_PROVIDER` not provided).** Component logs to console on first send (same as today). No initial load attempt.
- **Two `getSession` calls in flight, second resolves first.** First call is cancelled by `switchMap` when the second is pushed; its `HttpClient` request aborts and no state update from it ever runs.
- **App's `?chatSession=` points at a deleted/foreign session.** `getInitialSession()` silently falls back to recent — the app's URL stays "wrong" until the next navigation; acceptable for v1.

## Future Direction (informational, not designed)

- **Session list / sidebar UI in ui-common.** Component reads `provider.listSessions()`; clicking a row drives the chat's `[sessionId]`; long-press / context menu for `renameSession` + `deleteSession`.
- **Reactive `getInitialSession()` re-fires.** If routing patterns ever require live re-syncs of `?chatSession=` without component remount, route the query-param signal through the chat's `sessionId` input from the app side; the chat's existing input-change logic handles it.
- **Streaming responses.** Switch `ChatResponse` to an `Observable<ChatStreamChunk>` and adapt `_onMessageSent`. Server side and provider both need rework.
- **Branching / edit / retry.** Backend schema is ready; UI would add an "edit user message" affordance and a separate command that creates a sibling rather than re-using the leaf.
- **Optimistic uid for live-sent messages.** Server could return uids during a streaming send for branching UIs later.
