import { DynamicActionModalDef } from '../../dynamic/action/modal/dynamic-action-modal-def'
import { TableCellTypeConfig } from '../../table-cell-types/table-cell-type-config'

export type TableCellTypeConfigStringAction =
  DynamicActionModalDef

export interface TableCellTypeConfigString extends TableCellTypeConfig<'string'> {
  action?: TableCellTypeConfigStringAction
}
