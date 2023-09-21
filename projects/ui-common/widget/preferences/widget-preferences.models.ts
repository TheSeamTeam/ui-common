import { TheSeamPreferencesBase } from '@theseam/ui-common/services'

export interface TheSeamWidgetPreferences_v1 extends TheSeamPreferencesBase {
  version: 1
  collapsed?: boolean
}

export type TheSeamWidgetPreferences = TheSeamWidgetPreferences_v1

export const CURRENT_WIDGET_PREFERENCES_VERSION = 1

export const EMPTY_WIDGET_PREFERENCES: TheSeamWidgetPreferences = {
  version: 1,
}
