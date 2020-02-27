import { DynamicActionLinkDef } from '../../dynamic/action/link/dynamic-action-link-def'
import { DynamicActionModalDef } from '../../dynamic/action/modal/dynamic-action-modal-def'
import { DynamicValue } from '../../dynamic/index'
import { TableCellTypeConfig } from '../../table-cell-types/table-cell-type-config'

export type TableCellTypeStringConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigString extends TableCellTypeConfig<'string'> {
  action?: TableCellTypeStringConfigAction

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>
}
