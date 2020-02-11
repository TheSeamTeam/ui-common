import { ComponentType } from '@angular/cdk/portal'

import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

// export interface IDynamicActionModalResultAction {

//   /**
//    * If the modal result equals this value then the action will execute.
//    *
//    * TODO: Should this be a boolean evaluator instead?
//    */
//   value?: DynamicValue<any>

//   /**
//    * Action to execute when modal result equals value.
//    */
//   action?: IDynamicActionDef<string>

// }

export interface IDynamicActionModalDef extends IDynamicActionDef<'modal'> {

  component?: DynamicValue<string | ComponentType<{}>>

  // TODO: Replace with a JSON valid `ModalConfig`
  data?: any

  resultActions?: { [value: string]: IDynamicActionDef<string> }

}
