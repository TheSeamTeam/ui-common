import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

export type TableCellTypeProgressCircleConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigProgressCircle extends TableCellTypeConfig<'progress-circle'> {

  /**
   *
   */
  action?: TableCellTypeProgressCircleConfigAction

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>

  /**
   * Screen-reader text.
   */
  srOnly?: DynamicValue<string>

  /**
   * Progress circle.
   *
   */
  fillBackground?: DynamicValue<boolean>

  showText?: DynamicValue<boolean>

  hiddenOnEmpty?: DynamicValue<boolean>

  pending?: DynamicValue<boolean>

  tooltip?: DynamicValue<string>

  tooltipClass?: DynamicValue<string>

  tooltipPlacement?: DynamicValue<string>

  tooltipContainer?: DynamicValue<string>

}
