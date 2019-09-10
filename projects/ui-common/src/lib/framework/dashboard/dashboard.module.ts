import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { DashboardWidgetsComponent } from './dashboard-widgets/dashboard-widgets.component'
import { DashboardComponent } from './dashboard.component'

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardWidgetsComponent
  ],
  imports: [
    CommonModule,
    PortalModule,
    DragDropModule
  ],
  exports: [
    DashboardComponent,
    DashboardWidgetsComponent
  ]
})
export class TheSeamDashboardModule { }
