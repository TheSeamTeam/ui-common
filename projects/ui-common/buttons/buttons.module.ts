import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamProgressModule } from '@theseam/ui-common/progress'

import { TheSeamAnchorBadgeButtonComponent, TheSeamBadgeButtonComponent } from './badge-button/badge-button.component'
import { TheSeamAnchorButtonComponent, TheSeamButtonComponent } from './button/button.component'
import { TheSeamProgressCircleButtonComponent } from './progress-circle-button/progress-circle-button.component'
import { TheSeamToggleButtonComponent } from './toggle-button/toggle-button.component'

@NgModule({
  declarations: [
    TheSeamBadgeButtonComponent,
    TheSeamProgressCircleButtonComponent,
    TheSeamToggleButtonComponent,
    TheSeamButtonComponent,
    TheSeamAnchorButtonComponent,
    TheSeamAnchorBadgeButtonComponent,
  ],
  imports: [
    CommonModule,
    TheSeamProgressModule
  ],
  exports: [
    TheSeamBadgeButtonComponent,
    TheSeamProgressCircleButtonComponent,
    TheSeamToggleButtonComponent,
    TheSeamButtonComponent,
    TheSeamAnchorButtonComponent,
    TheSeamAnchorBadgeButtonComponent,
  ]
})
export class TheSeamButtonsModule { }
