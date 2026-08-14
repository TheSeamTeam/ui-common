import { ElementRef } from '@angular/core'
import { Observable } from 'rxjs'

/** What to do when a step's target element cannot be resolved. */
export type TheSeamGuideMissPolicy = 'skip' | 'elementless' | 'end'

export interface TheSeamGuidePopover {
  title?: string
  description?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export interface TheSeamGuideStep {
  /**
   * Target for this step. Omit for an elementless (centered) step.
   *
   * A string is resolved against the target registry first, then falls back to
   * `document.querySelector`. Only registry-resolved targets get mid-step
   * recovery.
   */
  element?: string | Element | ElementRef<Element>

  popover?: TheSeamGuidePopover

  /** Overrides the guide-level value for this step. */
  targetTimeout?: number

  /** Overrides the guide-level policy. `'end'` marks this step required. */
  onMissingTarget?: TheSeamGuideMissPolicy

  /** Overrides the guide-level mid-step loss policy. */
  onTargetLost?: TheSeamGuideMissPolicy

  beforeStep?: () => void | Promise<void> | Observable<unknown>
  afterStep?: () => void | Promise<void> | Observable<unknown>
}
