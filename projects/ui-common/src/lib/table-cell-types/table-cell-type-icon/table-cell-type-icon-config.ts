import { DynamicActionLinkDef } from '../../dynamic/action/link/dynamic-action-link-def'
import { DynamicActionModalDef } from '../../dynamic/action/modal/dynamic-action-modal-def'
import { DynamicValue } from '../../dynamic/models/dynamic-value'
import { TheSeamIconType } from '../../icon/icon/icon.component'
import { TableCellTypeConfig } from '../table-cell-type-config'

export type TableCellTypeIconConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigIcon extends TableCellTypeConfig<'icon'> {
  /**
   *
   */
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