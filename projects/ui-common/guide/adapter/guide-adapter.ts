import { InjectionToken } from '@angular/core'

/**
 * A popover as the presentation engine sees it.
 *
 * `HTMLElement` carries template and component content. The service creates,
 * owns, and destroys that node; the adapter only places it, which is what
 * keeps the adapter free of Angular.
 *
 * **An `HTMLElement` slot must be re-adopted on every re-render — never
 * cloned, never wrapped in a fresh element, never rebuilt from its
 * `outerHTML`.** The engine may tear down and rebuild its whole popover DOM
 * on every render (driver.js does, including on the re-drive behind
 * `refresh()`), but the identical node handed in here must end up back in
 * the new DOM each time. Re-adoption of that exact node is what lets the
 * Angular view living inside it survive untouched across a rebuild —
 * preserving scroll position, a typed-in value, or an in-flight animation
 * instead of resetting it.
 */
export interface TheSeamGuideAdapterPopover {
  title?: string | HTMLElement
  description?: string | HTMLElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

/**
 * A step as the presentation engine sees it.
 *
 * `element` is a resolver function, not an element, so the engine re-resolves
 * at paint time. That is what makes mid-step recovery a `refresh()` rather than
 * a step transition.
 */
export interface TheSeamGuideAdapterStep {
  element?: () => Element | undefined
  popover?: TheSeamGuideAdapterPopover
}

export interface TheSeamGuideAdapterConfig {
  steps: TheSeamGuideAdapterStep[]
  /** When false, Escape, overlay click, and the close button must not dismiss. */
  allowUserDismiss: boolean
}

/** How the engine reports user intent. It never advances itself. */
export interface TheSeamGuideAdapterCallbacks {
  onNextRequested(): void
  onPreviousRequested(): void
  onCloseRequested(): void
}

export interface TheSeamGuideAdapter {
  start(
    config: TheSeamGuideAdapterConfig,
    callbacks: TheSeamGuideAdapterCallbacks,
  ): void
  next(): void
  previous(): void
  moveTo(index: number): void
  /**
   * Re-resolves and repositions the current step in place, without a step
   * transition. This is the operation mid-step recovery depends on.
   *
   * **Must re-invoke the current step's element resolver** (the function on
   * `TheSeamGuideAdapterStep.element`), not merely reposition around a
   * previously-resolved element. An implementation that only repositions
   * passes every session-layer spec — the session never observes the
   * difference directly — but silently keeps highlighting a detached element
   * during recovery while still reporting `targetRecovered`. driver.js's own
   * `refresh()` has exactly this bug, which is why the driver.js adapter does
   * not call it and instead re-drives the current index to force
   * re-resolution.
   */
  refresh(): void
  destroy(): void
  isActive(): boolean
}

export const THE_SEAM_GUIDE_ADAPTER = new InjectionToken<TheSeamGuideAdapter>(
  'THE_SEAM_GUIDE_ADAPTER',
)
