import { DynamicActionDef, DynamicValue } from '../../dynamic/index'

export interface DynamicDatatableRowAction {

  /**
   * Label displayed on the menu item.
   */
  label: DynamicValue<string>

  /** */
  action: DynamicActionDef<string>

  /**
   * Default: false
   */
  disabled?: DynamicValue<boolean>

  /**
   * Expression executed each row to decide if the action will be visible.
   */
  hidden?: DynamicValue<boolean>

}
