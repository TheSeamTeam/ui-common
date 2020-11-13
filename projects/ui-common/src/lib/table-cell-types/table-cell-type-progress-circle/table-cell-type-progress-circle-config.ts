import { DynamicActionLinkDef } from '../../dynamic/action/link/dynamic-action-link-def'
import { DynamicActionModalDef } from '../../dynamic/action/modal/dynamic-action-modal-def'
import { DynamicValue } from '../../dynamic/models/dynamic-value'
import { TableCellTypeConfig } from '../table-cell-type-config'

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
