import { InjectionToken } from '@angular/core'

import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'

export const THESEAM_DATABOARDLIST_PREFERENCES_ACCESSOR = new InjectionToken<TheSeamPreferencesAccessor>(
  'TheSeamDataboardListPreferencesAccessor'
)
