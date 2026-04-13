import { AbstractControl } from '@angular/forms'

/**
 * Describes a single step rendered by `TheSeamSegmentedProgressBarComponent`.
 *
 * A step's visual state is derived from either an explicit `completed` flag
 * or the validity of an injected `control`. When a `control` is provided,
 * the step is considered visually complete only after it has been visited
 * (either `isCurrent` or `hasVisited` is true) to avoid marking steps as
 * done before the user has seen them.
 */
export interface TheSeamSegmentedProgressBarStep {
  /** Tooltip label shown on hover when `enableTooltip` is true. */
  label: string
  /** Unique identifier for the step — used as the `@for` track key. */
  value: string
  /**
   * Explicit completion flag. When set, takes precedence over `control`.
   * Leave undefined to derive state from `control` instead.
   */
  completed?: boolean
  /** Optional form control whose validity drives state when `completed` is unset. */
  control?: AbstractControl
  /** Whether this step is the currently-active step. */
  isCurrent?: boolean
  /** Whether the user has previously visited this step. */
  hasVisited?: boolean
}
