import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OverlayModule } from '@angular/cdk/overlay'
import { A11yModule } from '@angular/cdk/a11y'

import { TheSeamTooltipComponent } from './tooltip.component'
import { TheSeamTooltipDirective } from './tooltip.directive'

@NgModule({
  declarations: [
    TheSeamTooltipComponent,
    TheSeamTooltipDirective,
  ],
  imports: [
    CommonModule,
    OverlayModule,
    A11yModule,
  ],
  exports: [
    TheSeamTooltipDirective,
  ],
})
export class TheSeamTooltipModule { }
