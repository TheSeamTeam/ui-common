import { Type, ɵgetLContext as getLContext } from '@angular/core'

/**
 * Index of the context slot in Angular's internal `LView` array.
 *
 * Unlike `ng.getComponent`, `ɵgetLContext` is a real (if private) export
 * rather than a devMode-only global, so this helper works in a production
 * build — verified by running the story suite against a built
 * `storybook-static`. What it IS pinned to is Angular's internal `LView`
 * layout: if this slot index ever moves, `getComponentInstance()` returns the
 * wrong object or null rather than failing loudly. Re-verify on a major
 * Angular upgrade, against a production build rather than the dev server.
 */
const CONTEXT = 8

export function getComponentInstance<T>(
  element: Element | null | undefined,
  componentType?: Type<T>,
): T | null {
  if (!element) return null

  const ctx = getLContext(element)
  if (!ctx) return null

  if (ctx.component != null) {
    return match(ctx.component, componentType)
  }

  const lView = ctx.lView
  if (!lView) return null

  // Host component of this node (same as ng.getComponent)
  const atNode = getComponentAtNode(lView, ctx.nodeIndex)
  if (atNode != null) {
    const matched = match(atNode, componentType)
    if (matched) return matched
  }

  // Fallback: owning component view context (same idea as ng.getOwningComponent)
  const owning = lView[CONTEXT]
  return match(owning, componentType)
}

function match<T>(value: unknown, type?: Type<T>): T | null {
  if (value == null) return null
  if (!type) return value as T
  return value instanceof type ? value : null
}

function getComponentAtNode(lView: any[], nodeIndex: number): unknown {
  const slot = lView[nodeIndex]
  if (!slot) return null
  // Component host slot is either an LView or an LContainer whose [0]/HOST is the LView
  const childView =
    Array.isArray(slot) && Array.isArray(slot[1]) ? slot : slot[0]
  if (!Array.isArray(childView)) return null
  return childView[CONTEXT] ?? null
}
