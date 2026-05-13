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
