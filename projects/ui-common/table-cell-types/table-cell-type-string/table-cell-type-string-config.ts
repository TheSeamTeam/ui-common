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

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  // TODO: refactor TableCellTypeConfig styles obj to be dynamic?
  styleAttr?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  // TODO: refactor TableCellTypeConfig cssClass obj to be dynamic?
  classAttr?: DynamicValue<string | string[]>

}
