import { Type, ɵgetLContext as getLContext } from '@angular/core'

const CONTEXT = 8 // LView[CONTEXT]

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
