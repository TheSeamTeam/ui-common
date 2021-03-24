import { ComponentType } from '@angular/cdk/portal'

import { DynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface DynamicActionModalDef extends DynamicActionDef<'modal'> {

  component?: DynamicValue<string | ComponentType<{}>>

  // TODO: Replace with a JSON valid `ModalConfig`
  data?: any

  resultActions?: { [value: string]: DynamicActionDef<string> }

}
