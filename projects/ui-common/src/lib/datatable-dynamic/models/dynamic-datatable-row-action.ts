import { DynamicValue, IDynamicActionDef } from '../../dynamic/index'
// import { DynamicActionDefTypeName } from '../../dynamic/models/dynamic-action-def-type';

import { IDynamicDatatableConfirmDialog } from '../models/index'

export interface IDynamicDatatableRowAction<T = 'api' | 'link' | 'modal'> {

  /**
   * Label displayed on the menu item.
   */
  label: DynamicValue<string>

  /** */
  action: IDynamicActionDef<T>

  /**
   * Default: false
   */
  disabled?: DynamicValue<boolean>

  /**
   * Expression executed each row to decide if the action will be visible.
   */
  hidden?: DynamicValue<boolean>

  /**
   * Show a confirmation dialog before action is executed.
   *
   * NOTE: May not be supported by all types.
   *
   * TODO: Move to its own interface if class are refactored back to interfaces.
   * Consider changing this to a generic prompt, which may cover more use cases
   * than a simple confirmation. On the other hand a generic prompt may be too
   * open for what this properties purpose is.
   */
  confirmDialog?: IDynamicDatatableConfirmDialog

}
