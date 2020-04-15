import { DynamicActionLinkDef } from '../../dynamic/action/link/dynamic-action-link-def'
import { DynamicActionModalDef } from '../../dynamic/action/modal/dynamic-action-modal-def'
import { DynamicValue } from '../../dynamic/models/dynamic-value'
import { SeamIcon } from '../../icon'
import { TheSeamIconType } from '../../icon/icon/icon.component'
import { TableCellTypeConfig } from '../table-cell-type-config'

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
  fillBackground: boolean

  showText: boolean

  hiddenOnEmpty: boolean

  total: number

  numComplete: number

  tooltip: DynamicValue<string>

  tooltipClass: string

  tooltipPlacement: string

  tooltipContainer: string

  /**
   * Icon inputs
   */
  icon?: DynamicValue<string>

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
