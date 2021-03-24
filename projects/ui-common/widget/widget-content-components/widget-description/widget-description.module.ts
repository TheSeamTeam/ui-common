import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { WidgetDescriptionComponent } from './widget-description.component'

@NgModule({
  declarations: [
    WidgetDescriptionComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetDescriptionComponent
  ]
})
export class TheSeamWidgetDescriptionModule { }
