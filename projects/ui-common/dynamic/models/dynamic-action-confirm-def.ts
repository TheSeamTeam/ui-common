import { ThemeTypes } from '@theseam/ui-common/models'

import { DynamicValue } from './dynamic-value'

// TODO: Consider making this a common action.
export interface DynamicActionConfirmDef {

  message?: DynamicValue<string>

  alert?: DynamicValue<string | { message: string, type: ThemeTypes }>

  disabled?: DynamicValue<boolean>
}
