import { InjectionToken } from '@angular/core'

import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'

export const THESEAM_WIDGET_PREFERENCES_ACCESSOR = new InjectionToken<TheSeamPreferencesAccessor>(
  'TheSeamWidgetPreferencesAccessor'
)
