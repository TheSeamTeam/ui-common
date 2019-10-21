import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { WidgetHeaderBadgeComponent } from './widget-header-badge.component'

@NgModule({
  declarations: [
    WidgetHeaderBadgeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetHeaderBadgeComponent
  ]
})
export class TheSeamWidgetHeaderBadgeModule { }
