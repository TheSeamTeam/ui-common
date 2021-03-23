import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@lib/ui-common/dynamic'
import { TableCellTypeConfig } from '@lib/ui-common/table-cell-type'

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
