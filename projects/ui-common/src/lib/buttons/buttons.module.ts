import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamProgressModule } from '../progress'

import { AnchorBadgeButtonComponent, BadgeButtonComponent } from './badge-button/badge-button.component'
import { AnchorButtonComponent, ButtonComponent } from './button/button.component'
import { ProgressCircleButtonComponent } from './progress-circle-button/progress-circle-button.component'
import { ToggleButtonComponent } from './toggle-button/toggle-button.component'

@NgModule({
  declarations: [
    BadgeButtonComponent,
    ProgressCircleButtonComponent,
    ToggleButtonComponent,
    ButtonComponent,
    AnchorButtonComponent,
    AnchorBadgeButtonComponent
  ],
  imports: [
    CommonModule,
    TheSeamProgressModule
  ],
  exports: [
    BadgeButtonComponent,
    ProgressCircleButtonComponent,
    ToggleButtonComponent,
    ButtonComponent,
    AnchorButtonComponent,
    AnchorBadgeButtonComponent
  ]
})
export class TheSeamButtonsModule { }
