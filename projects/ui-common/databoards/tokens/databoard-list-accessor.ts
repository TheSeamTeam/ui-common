import { InjectionToken } from '@angular/core'

import { TheSeamDataboardListAccessor } from '../models/databoard-list-accessor'

export const THESEAM_DATABOARDLIST_ACCESSOR = new InjectionToken<TheSeamDataboardListAccessor>(
  'TheSeamDataboardListAccessor'
)
