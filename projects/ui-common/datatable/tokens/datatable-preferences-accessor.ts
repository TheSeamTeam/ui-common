import { InjectionToken } from '@angular/core'

import { ITheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'

export const THESEAM_DATATABLE_PREFERENCES_ACCESSOR = new InjectionToken<ITheSeamDatatablePreferencesAccessor>(
  'ITheSeamDatatablePreferencesAccessor'
)
