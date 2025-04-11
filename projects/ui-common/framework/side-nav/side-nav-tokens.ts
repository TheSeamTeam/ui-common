import { InjectionToken } from '@angular/core'

export interface SideNavAccessor {
  overlay: boolean
  collapse(): void
}

export const THESEAM_SIDE_NAV_ACCESSOR = new InjectionToken<SideNavAccessor>(
  'THESEAM_SIDE_NAV_ACCESSOR'
)

export interface SideNavConfig {
  /**
   * Default: false
   */
  activeNavigatable: boolean
}

export const THESEAM_SIDE_NAV_CONFIG = new InjectionToken<SideNavConfig>(
  'THESEAM_SIDE_NAV_CONFIG'
)

export const DEFAULT_SIDE_NAV_CONFIG: SideNavConfig = {
  activeNavigatable: false
}
