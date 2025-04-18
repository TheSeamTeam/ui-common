import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

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
