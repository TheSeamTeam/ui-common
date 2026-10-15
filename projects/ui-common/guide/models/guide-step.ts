import { ElementRef } from '@angular/core'
import { Observable } from 'rxjs'

import type { TheSeamGuideRef } from '../guide-ref'
import type { TheSeamGuideContent } from './guide-content'
import type { TheSeamGuideCloseReason } from './guide-event'

/** What to do when a step's target element cannot be resolved. */
export type TheSeamGuideMissPolicy = 'skip' | 'elementless' | 'end'

/** A button in the popover's footer. */
export type TheSeamGuideButton = 'next' | 'previous' | 'close'

/**
 * Every field but `title` and `description` is a single value, and the
 * nearest layer that sets it wins: step, then guide, then application.
 */
export interface TheSeamGuidePopover {
  /**
   * A string, a `TemplateRef`, or a standalone component.
   *
   * Omitting inherits from the guide and application layers. `null` opts this
   * step out of a slot the guide layer supplies — omission cannot express
   * that, because omission means "inherit".
   */
  title?: TheSeamGuideContent | null
  description?: TheSeamGuideContent | null
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'

  /**
   * The footer's buttons. Default all three. `'close'` shows only while the
   * guide is dismissible.
   *
   * Leaving out `'next'` makes a step the user finishes by doing something:
   * the Right arrow key no longer advances either, so the step must move the
   * guide on itself, with `TheSeamGuideRef.next()`. Leaving out `'previous'`
   * turns off the Left arrow key the same way.
   */
  showButtons?: TheSeamGuideButton[]

  /** Label of the Next button, as HTML. Default "Next". */
  nextButtonText?: string
  /** Label of the Previous button, as HTML. Default "Previous". */
  previousButtonText?: string
  /** Label of the Next button on the last step, as HTML. Default "Done". */
  doneButtonText?: string

  /**
   * Shows the step's position, "2 of 5" by default. Default false.
   *
   * It counts every step in the guide, so a skipped step leaves a gap in the
   * numbers. For anything else, the content context has `index` and `total`.
   */
  showProgress?: boolean
  /** `{{current}}` and `{{total}}` are filled in. Default "{{current}} of {{total}}". */
  progressText?: string
}

export interface TheSeamGuideStep {
  /**
   * Target for this step. Omit for an elementless (centered) step.
   *
   * A string is resolved against the target registry first, then falls back to
   * `document.querySelector`. Either one is waited for, up to `targetTimeout`,
   * if it is not there yet. Only registry-resolved targets get mid-step
   * recovery: a selector target that goes away is not noticed.
   *
   * Once found, the step also waits, up to `targetTimeout`, for animations on
   * the target or an element containing it, such as a dialog opening. While
   * the step shows, the highlight follows the target's size.
   */
  element?: string | Element | ElementRef<Element>

  popover?: TheSeamGuidePopover

  /** Overrides the guide-level value for this step. */
  targetTimeout?: number

  /** Overrides the guide-level policy. `'end'` marks this step required. */
  onMissingTarget?: TheSeamGuideMissPolicy

  /** Overrides the guide-level mid-step loss policy. */
  onTargetLost?: TheSeamGuideMissPolicy

  /**
   * Runs before this step paints. The step waits for a Promise to settle, or
   * for an Observable's first value or completion, whichever comes first.
   */
  beforeStep?: (
    context: TheSeamGuideBeforeStepContext,
  ) => void | Promise<void> | Observable<unknown>

  /**
   * Runs when the guide leaves this step after showing it: moving to another
   * step, finishing, or closing for any reason. This is where to undo what
   * `beforeStep` set up. `context.closeReason` tells closing apart from
   * moving on, for a hook that should only act on one of them.
   *
   * Moving to another step waits for it, as `beforeStep` does. Closing does
   * not: the guide is already gone by the time it runs.
   */
  afterStep?: (
    context: TheSeamGuideAfterStepContext,
  ) => void | Promise<void> | Observable<unknown>
}

/** What every step hook is told about the step it runs for. */
export interface TheSeamGuideStepContext {
  guide: TheSeamGuideRef
  step: TheSeamGuideStep
  index: number
}

/** Whether `advanceWhenTarget` waits for its target to appear or to go away. */
export type TheSeamGuideTargetChange = 'appears' | 'disappears'

export interface TheSeamGuideBeforeStepContext extends TheSeamGuideStepContext {
  /**
   * Emits once, then completes, when the guide is done with this step: it
   * moves to another step, skips this one, or closes. Use it to stop what
   * `beforeStep` started.
   */
  readonly exit$: Observable<void>

  /**
   * Moves to the next step the first time `target` appears, or goes away,
   * after this is called. This is how a step waits for the user to do
   * something, such as open a dialog or close it. Stops when the step exits.
   *
   * `target` is resolved like a step's `element` string: a registered name,
   * then a selector.
   */
  advanceWhenTarget(target: string, on: TheSeamGuideTargetChange): void
}

export interface TheSeamGuideAfterStepContext extends TheSeamGuideStepContext {
  /** Why the guide is closing, or `null` when it is moving to another step. */
  closeReason: TheSeamGuideCloseReason | null
}
