/**
 * Implemented by components that contribute "what the user is currently looking at"
 * to the AI chat assistant. Instances are registered with `TheSeamChatContextRegistry`
 * (see chat-context-registry.service.ts) and read at chat-send time.
 *
 * `getContext()` returning null/undefined means "I have nothing useful to contribute
 * right now"; the registry drops that entry from the snapshot.
 */
export interface TheSeamChatContext {
  /** Discriminator — used by the backend formatter table. e.g. 'datatable', 'modal'. */
  readonly type: string

  /** When true, this context is included even while a 'modal'-typed context is registered. Default false. */
  readonly alwaysVisible?: boolean

  getContext(): unknown | Promise<unknown>
}

/** Wire-shape of one context entry sent to the backend. */
export interface TheSeamChatContextPayload {
  type: string
  data: unknown
}
