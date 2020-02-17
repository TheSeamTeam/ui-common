import { InjectionToken } from '@angular/core'

import { DynamicAction } from '../models/dynamic-action'

export const THESEAM_DYNAMIC_ACTION = new InjectionToken<DynamicAction<string>>(
  'Action for executing a DynamicAction'
)
