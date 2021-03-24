import { DynamicActionConfirmDef } from '@theseam/ui-common/dynamic'

import { TableCellTypeName } from './table-cell-type-name'

export interface TableCellActionBase<T extends TableCellTypeName> {
  type: T

  /**
   * If defined, the action must be confirmed.
   */
  confirmDef?: DynamicActionConfirmDef

  /**
   * Default: false
   */
  disabled?: boolean
}
