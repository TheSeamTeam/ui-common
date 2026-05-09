import { Injectable } from '@angular/core'

import { TheSeamChatContext, TheSeamChatContextPayload } from './chat-context'

@Injectable({ providedIn: 'root' })
export class TheSeamChatContextRegistry {
  private readonly _contexts = new Set<TheSeamChatContext>()

  /**
   * Register a context. Returns an unregister function — pair it with DestroyRef:
   *   inject(DestroyRef).onDestroy(registry.register(ctx))
   */
  register(ctx: TheSeamChatContext): () => void {
    this._contexts.add(ctx)
    return () => this._contexts.delete(ctx)
  }

  unregister(ctx: TheSeamChatContext): void {
    this._contexts.delete(ctx)
  }

  /**
   * Resolve registered contexts to a wire-ready payload list. Applies the modal-mask
   * rule (a `modal`-typed context hides others unless they set `alwaysVisible`) and
   * drops entries whose `getContext()` returns null/undefined.
   */
  async snapshot(): Promise<TheSeamChatContextPayload[]> {
    const all = [...this._contexts]
    const masked = all.some((c) => c.type === 'modal')
    const visible = masked
      ? all.filter((c) => c.type === 'modal' || c.alwaysVisible)
      : all
    const resolved = await Promise.all(
      visible.map(async (c) => ({ type: c.type, data: await c.getContext() })),
    )
    return resolved.filter((p) => p.data != null)
  }
}
