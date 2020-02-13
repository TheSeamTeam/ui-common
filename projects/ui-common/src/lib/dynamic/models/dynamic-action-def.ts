import { IDynamicActionConfirmDef } from './dynamic-action-confirm-def'

// TODO: Add something to the model that clarifies what is supported from JSON or javascript only.
export interface IDynamicActionDef<T extends string> {

  readonly type: T

  /**
   * If defined, the action must be confirmed.
   */
  confirmDef?: IDynamicActionConfirmDef

  // TODO: Fix model to avoid this.
  [key: string]: any
}
