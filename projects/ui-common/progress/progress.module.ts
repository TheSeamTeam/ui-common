import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ProgressCircleComponent } from './progress-circle/progress-circle.component'

@NgModule({
  declarations: [
    ProgressCircleComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProgressCircleComponent
  ]
})
export class TheSeamProgressModule { }
