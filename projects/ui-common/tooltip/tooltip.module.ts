import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OverlayModule } from '@angular/cdk/overlay'

import { TheSeamTooltipComponent } from './tooltip.component'
import { TheSeamTooltipDirective } from './tooltip.directive'

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    TheSeamTooltipComponent,
    TheSeamTooltipDirective,
  ],
  exports: [TheSeamTooltipDirective],
})
export class TheSeamTooltipModule {}
