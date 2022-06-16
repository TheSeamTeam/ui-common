import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlDirective } from './map-control.directive'

@NgModule({
  declarations: [
    TheSeamMapControlDirective,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TheSeamMapControlDirective,
  ]
})
export class TheSeamMapControlModule { }
