import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { WidgetContentHeaderComponent } from './widget-content-header.component'

@NgModule({
  declarations: [
    WidgetContentHeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetContentHeaderComponent
  ]
})
export class TheSeamWidgetContentHeaderModule { }
