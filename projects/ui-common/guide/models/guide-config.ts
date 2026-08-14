import { TheSeamGuideMissPolicy, TheSeamGuideStep } from './guide-step'

export interface TheSeamGuideConfig {
  steps: TheSeamGuideStep[]

  /** User may dismiss via Escape, overlay click, or close button. Default true. */
  dismissible?: boolean

  /** Milliseconds to wait for a target before the miss policy applies. Default 3000. */
  targetTimeout?: number

  /** Guide-level miss policy, applied at step entry. Default 'skip'. */
  onMissingTarget?: TheSeamGuideMissPolicy

  /**
   * Milliseconds to wait for a target to return after it disappears mid-step,
   * before `onTargetLost` applies. Default 1000.
   */
  targetLostGrace?: number

  /** Policy for a target lost mid-step. Default 'elementless'. */
  onTargetLost?: TheSeamGuideMissPolicy
}

export type TheSeamGuideResolvedConfig = Required<
  Omit<TheSeamGuideConfig, 'steps'>
>

export const THE_SEAM_GUIDE_DEFAULTS: TheSeamGuideResolvedConfig = {
  dismissible: true,
  targetTimeout: 3000,
  onMissingTarget: 'skip',
  targetLostGrace: 1000,
  onTargetLost: 'elementless',
}
