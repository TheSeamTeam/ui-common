import { InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'

import { DashboardWidgetContainerComponent } from './dashboard-widget-container/dashboard-widget-container.component'

export interface DashboardWidgetsAccessor {
  containers$: Observable<DashboardWidgetContainerComponent[]>
}

export const THESEAM_DASHBOARD_WIDGETS_ACCESSOR = new InjectionToken<DashboardWidgetsAccessor>(
  'THESEAM_DASHBOARD_WIDGETS_ACCESSOR'
)
