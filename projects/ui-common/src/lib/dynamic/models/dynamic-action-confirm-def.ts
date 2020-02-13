import { ThemeTypes } from '../../models/theme-types'

import { DynamicValue } from './dynamic-value'

// TODO: Consider making this a common action.
export interface IDynamicActionConfirmDef {

  message?: DynamicValue<string>

  alert?: DynamicValue<string | { message: string, type: ThemeTypes }>

  disabled?: DynamicValue<boolean>
}
