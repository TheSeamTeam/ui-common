import { TheSeamGuideStep } from './guide-step'

export type TheSeamGuideCloseReason =
  | 'completed'
  | 'dismissed'
  | 'targetMissing'
  | 'superseded'
  | 'destroyed'

export interface TheSeamGuideResult {
  reason: TheSeamGuideCloseReason
  /** Index of the step that was active when the guide closed, or -1. */
  lastIndex: number
}

export type TheSeamGuideEvent =
  | { type: 'started' }
  | { type: 'stepChanged'; index: number; step: TheSeamGuideStep }
  | { type: 'stepSkipped'; index: number; step: TheSeamGuideStep }
  | { type: 'targetLost'; index: number; step: TheSeamGuideStep }
  | { type: 'targetRecovered'; index: number; step: TheSeamGuideStep }
  | { type: 'closed'; result: TheSeamGuideResult }
