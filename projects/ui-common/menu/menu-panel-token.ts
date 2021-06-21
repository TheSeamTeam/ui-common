import { InjectionToken } from '@angular/core'

import { ITheSeamMenuPanel } from './menu-panel'

/**
 * Injection token used to provide the parent menu to menu-specific components.
 */
export const THESEAM_MENU_PANEL = new InjectionToken<ITheSeamMenuPanel>('THESEAM_MENU_PANEL')
