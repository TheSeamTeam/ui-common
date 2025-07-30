import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OverlayModule } from '@angular/cdk/overlay'
import { A11yModule } from '@angular/cdk/a11y'

import { TooltipComponent } from './tooltip.component'
import { SeamTooltipDirective } from './tooltip.directive'

@NgModule({
  declarations: [
    TooltipComponent,
    SeamTooltipDirective
  ],
  imports: [
    CommonModule,
    OverlayModule,
    A11yModule
  ],
  exports: [
    SeamTooltipDirective
  ]
})
export class TooltipModule { }
