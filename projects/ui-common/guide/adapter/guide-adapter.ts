import { InjectionToken } from '@angular/core'

/**
 * A step as the presentation engine sees it.
 *
 * `element` is a resolver function, not an element, so the engine re-resolves
 * at paint time. That is what makes mid-step recovery a `refresh()` rather than
 * a step transition.
 */
export interface TheSeamGuideAdapterStep {
  element?: () => Element | undefined
  popover?: {
    title?: string
    /**
     * `HTMLElement` is accepted so that template and component popover content
     * can be added later without changing the adapter boundary. v1 only ever
     * passes a string.
     */
    description?: string | HTMLElement
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
  }
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
  refresh(): void
  destroy(): void
  isActive(): boolean
}

export const THE_SEAM_GUIDE_ADAPTER = new InjectionToken<TheSeamGuideAdapter>(
  'THE_SEAM_GUIDE_ADAPTER',
)
