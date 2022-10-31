import { InjectionToken } from '@angular/core'

export interface SideNavAccessor {
  overlay: boolean
  collapse(): void
}

export const THESEAM_SIDE_NAV_ACCESSOR = new InjectionToken<SideNavAccessor>(
  'THESEAM_SIDE_NAV_ACCESSOR'
)
