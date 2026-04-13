import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core'
import { FormControlStatus } from '@angular/forms'
import { Subscription } from 'rxjs'

import { TheSeamSegmentedProgressBarStep } from './segmented-progress-bar.models'

type CellState = 'DEFAULT' | 'COMPLETE'

@Component({
  selector: 'seam-segmented-progress-bar-cell',
  template: '',
  host: {
    '[class.bg-light]': '_state() === "DEFAULT"',
    '[class.bg-success]': '_state() === "COMPLETE"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedProgressBarCellComponent {
  private readonly _destroyRef = inject(DestroyRef)

  readonly step = input.required<TheSeamSegmentedProgressBarStep>()

  private readonly _controlStatus = signal<FormControlStatus | null>(null)

  protected readonly _state = computed<CellState>(() => {
    const s = this.step()
    if (s.completed !== undefined) {
      return s.completed ? 'COMPLETE' : 'DEFAULT'
    }
    if (s.control) {
      const status = this._controlStatus()
      if (status === 'VALID' && (s.isCurrent || s.hasVisited)) {
        return 'COMPLETE'
      }
      return 'DEFAULT'
    }
    return 'DEFAULT'
  })

  constructor() {
    let sub: Subscription | undefined
    effect(() => {
      const s = this.step()
      sub?.unsubscribe()
      sub = undefined
      if (s.control) {
        this._controlStatus.set(s.control.status)
        sub = s.control.statusChanges.subscribe((status) =>
          this._controlStatus.set(status),
        )
      } else {
        this._controlStatus.set(null)
      }
    })
    this._destroyRef.onDestroy(() => sub?.unsubscribe())
  }
}
