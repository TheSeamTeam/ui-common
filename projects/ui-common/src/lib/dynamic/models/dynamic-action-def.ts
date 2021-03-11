import { TableCellTypeName } from '@lib/ui-common/table-cell-types'

import { DynamicActionConfirmDef } from './dynamic-action-confirm-def'

// TODO: Add something to the model that clarifies what is supported from JSON or javascript only.
export interface DynamicActionDef<T extends TableCellTypeName> {

  readonly type: T

  /**
   * If defined, the action must be confirmed.
   */
  confirmDef?: DynamicActionConfirmDef

  // TODO: Fix model to avoid this.
  [key: string]: any
}
