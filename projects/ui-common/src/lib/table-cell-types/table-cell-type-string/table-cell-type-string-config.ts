import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@lib/ui-common/dynamic'
import { TableCellTypeConfig } from '@lib/ui-common/table-cell-type'

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
