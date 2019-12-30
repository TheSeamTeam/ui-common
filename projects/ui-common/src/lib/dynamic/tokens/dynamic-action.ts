import { InjectionToken } from '@angular/core'

import { IDynamicAction } from '../models/dynamic-action'

export const THESEAM_DYNAMIC_ACTION = new InjectionToken<IDynamicAction<string>>(
  'Action for executing a DynamicAction'
)
