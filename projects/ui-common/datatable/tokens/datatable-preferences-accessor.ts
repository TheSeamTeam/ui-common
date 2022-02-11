import { InjectionToken } from '@angular/core'

import { TheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'

export const THESEAM_DATATABLE_PREFERENCES_ACCESSOR = new InjectionToken<TheSeamDatatablePreferencesAccessor>(
  'TheSeamDatatablePreferencesAccessor'
)
