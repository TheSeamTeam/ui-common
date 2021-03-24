import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

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
