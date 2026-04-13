import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core'

import { TheSeamTooltipDirective } from '@theseam/ui-common/tooltip'

import { SegmentedProgressBarCellComponent } from './segmented-progress-bar-cell.component'
import { TheSeamSegmentedProgressBarStep } from './segmented-progress-bar.models'

@Component({
  selector: 'seam-segmented-progress-bar',
  templateUrl: './segmented-progress-bar.component.html',
  styleUrls: ['./segmented-progress-bar.component.scss'],
  imports: [SegmentedProgressBarCellComponent, TheSeamTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamSegmentedProgressBarComponent {
  readonly progressSteps = input<TheSeamSegmentedProgressBarStep[]>([])
  readonly clickable = input(false, { transform: booleanAttribute })
  readonly enableTooltip = input(false, { transform: booleanAttribute })

  readonly cellClicked = output<TheSeamSegmentedProgressBarStep>()

  onClickProgressCell(step: TheSeamSegmentedProgressBarStep): void {
    if (!this.clickable()) {
      return
    }
    this.cellClicked.emit(step)
  }
}
