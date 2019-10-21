import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '../../../buttons/index'

import { WidgetButtonGroupComponent } from './widget-button-group.component'

@NgModule({
  declarations: [
    WidgetButtonGroupComponent
  ],
  imports: [
    CommonModule,
    TheSeamButtonsModule
  ],
  exports: [
    WidgetButtonGroupComponent,

    TheSeamButtonsModule
  ]
})
export class TheSeamWidgetButtonGroupModule { }
