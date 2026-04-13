import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { ProgressCircleComponent } from './progress-circle/progress-circle.component'
import { TheSeamSegmentedProgressBarComponent } from './segmented-progress-bar/segmented-progress-bar.component'

@NgModule({
  declarations: [ProgressCircleComponent],
  imports: [CommonModule, TheSeamSegmentedProgressBarComponent],
  exports: [ProgressCircleComponent, TheSeamSegmentedProgressBarComponent],
})
export class TheSeamProgressModule {}
