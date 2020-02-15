import { DynamicValue, IDynamicActionDef } from '../../dynamic/index'

export interface IDynamicDatatableRowAction {

  /**
   * Label displayed on the menu item.
   */
  label: DynamicValue<string>

  /** */
  action: IDynamicActionDef<string>

  /**
   * Default: false
   */
  disabled?: DynamicValue<boolean>

  /**
   * Expression executed each row to decide if the action will be visible.
   */
  hidden?: DynamicValue<boolean>

}
