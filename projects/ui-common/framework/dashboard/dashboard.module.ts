import { DragDropModule } from '@angular/cdk/drag-drop'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { DashboardWidgetContainerComponent } from './dashboard-widget-container/dashboard-widget-container.component'
import {
  DashboardWidgetTemplateContainerComponent
} from './dashboard-widget-template-container/dashboard-widget-template-container.component'
import { DashboardWidgetPortalOutletDirective } from './dashboard-widgets/dashboard-widget-portal-outlet.directive'
import { DashboardWidgetsComponent } from './dashboard-widgets/dashboard-widgets.component'
import { DashboardComponent } from './dashboard.component'

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardWidgetsComponent,
    DashboardWidgetContainerComponent,
    DashboardWidgetTemplateContainerComponent,
    DashboardWidgetPortalOutletDirective
  ],
  imports: [
    CommonModule,
    PortalModule,
    DragDropModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamSharedModule
  ],
  exports: [
    DashboardComponent,
    DashboardWidgetsComponent,
    DashboardWidgetPortalOutletDirective
  ]
})
export class TheSeamDashboardModule { }
