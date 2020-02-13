import { ComponentType } from '@angular/cdk/portal'

import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionModalDef extends IDynamicActionDef<'modal'> {

  component?: DynamicValue<string | ComponentType<{}>>

  // TODO: Replace with a JSON valid `ModalConfig`
  data?: any

  resultActions?: { [value: string]: IDynamicActionDef<string> }

}
