import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionModalResultAction {

  /**
   * If the modal result equals this value then the action will execute.
   */
  value?: DynamicValue<any>

  /**
   * Action to execute when modal result equals value.
   */
  action?: IDynamicActionDef<'modal'>

}

export interface IDynamicActionModalDef extends IDynamicActionDef<'modal'> {

  modal?: DynamicValue<any>

  resultAction?: IDynamicActionModalResultAction

}
