import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@lib/ui-common/dynamic'
import { SeamIcon, TheSeamIconType } from '@lib/ui-common/icon'
import { TableCellTypeConfig } from '@lib/ui-common/table-cell-type'

export type TableCellTypeIconConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigProgressCircleIcon extends TableCellTypeConfig<'progress-circle-icon'> {

  /**
   * Progress circle with an icon fallback.
   *
   */

  /**
   * Progress circle inputs
   *
   */
  fillBackground?: DynamicValue<boolean>

  showText?: DynamicValue<boolean>

  hiddenOnEmpty?: DynamicValue<boolean>

  percentage?: DynamicValue<number>

  pending?: DynamicValue<boolean>

  tooltip?: DynamicValue<string>

  tooltipClass?: DynamicValue<string>

  tooltipPlacement?: DynamicValue<string>

  tooltipContainer?: DynamicValue<string>

  /**
   * Icon inputs
   */
  displayIcon?: DynamicValue<boolean>

  icon?: DynamicValue<SeamIcon>

  action?: TableCellTypeIconConfigAction

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>

  /**
   * Screen-reader text.
   */
  srOnly?: DynamicValue<string>

  /**
   * Css class added to the link element.
   */
  linkClass?: DynamicValue<string>

  /**
   * seam-icon `iconClass` input.
   */
  iconClass?: DynamicValue<string>

  /**
   * Can apply pre-defined icon styles.
   */
  iconType?: TheSeamIconType

}
