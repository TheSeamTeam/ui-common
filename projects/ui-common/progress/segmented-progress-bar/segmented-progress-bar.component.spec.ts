import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamSegmentedProgressBarComponent } from './segmented-progress-bar.component'
import { TheSeamSegmentedProgressBarStep } from './segmented-progress-bar.models'

describe('TheSeamSegmentedProgressBarComponent', () => {
  let spectator: SpectatorHost<TheSeamSegmentedProgressBarComponent>
  const createHost = createHostFactory(TheSeamSegmentedProgressBarComponent)

  const steps: TheSeamSegmentedProgressBarStep[] = [
    { label: 'One', value: 'one', completed: true },
    { label: 'Two', value: 'two', completed: false },
    { label: 'Three', value: 'three', completed: false },
  ]

  it('renders one cell per step', () => {
    spectator = createHost(
      `<seam-segmented-progress-bar [progressSteps]="steps"></seam-segmented-progress-bar>`,
      { hostProps: { steps } },
    )
    expect(spectator.queryAll('seam-segmented-progress-bar-cell')).toHaveLength(
      3,
    )
  })

  describe('click behavior', () => {
    it('does not emit cellClicked when clickable is false (default)', () => {
      const onClick = jest.fn()
      spectator = createHost(
        `<seam-segmented-progress-bar
          [progressSteps]="steps"
          (cellClicked)="onClick($event)">
        </seam-segmented-progress-bar>`,
        { hostProps: { steps, onClick } },
      )
      const cell = spectator.query('seam-segmented-progress-bar-cell')!
      spectator.click(cell)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('emits cellClicked with the step when clickable is true', () => {
      const onClick = jest.fn()
      spectator = createHost(
        `<seam-segmented-progress-bar
          [progressSteps]="steps"
          [clickable]="true"
          (cellClicked)="onClick($event)">
        </seam-segmented-progress-bar>`,
        { hostProps: { steps, onClick } },
      )
      const cells = spectator.queryAll('seam-segmented-progress-bar-cell')
      spectator.click(cells[1])
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(steps[1])
    })
  })

  describe('clickable coercion', () => {
    it('accepts the string "true" (attribute style) as truthy', () => {
      const onClick = jest.fn()
      spectator = createHost(
        `<seam-segmented-progress-bar
          [progressSteps]="steps"
          clickable="true"
          (cellClicked)="onClick($event)">
        </seam-segmented-progress-bar>`,
        { hostProps: { steps, onClick } },
      )
      spectator.click(spectator.query('seam-segmented-progress-bar-cell')!)
      expect(onClick).toHaveBeenCalled()
    })
  })
})
