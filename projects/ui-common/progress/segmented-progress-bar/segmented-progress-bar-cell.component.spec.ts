import { FormControl, Validators } from '@angular/forms'
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest'

import { SegmentedProgressBarCellComponent } from './segmented-progress-bar-cell.component'
import { TheSeamSegmentedProgressBarStep } from './segmented-progress-bar.models'

describe('SegmentedProgressBarCellComponent', () => {
  let spectator: Spectator<SegmentedProgressBarCellComponent>
  const createComponent = createComponentFactory({
    component: SegmentedProgressBarCellComponent,
  })

  function render(step: TheSeamSegmentedProgressBarStep) {
    spectator = createComponent({ props: { step } })
    spectator.detectChanges()
  }

  describe('with explicit `completed`', () => {
    it('renders the COMPLETE class when completed is true', () => {
      render({ label: 'a', value: 'a', completed: true })
      expect(spectator.element).toHaveClass('bg-success')
      expect(spectator.element).not.toHaveClass('bg-light')
    })

    it('renders the DEFAULT class when completed is false', () => {
      render({ label: 'a', value: 'a', completed: false })
      expect(spectator.element).toHaveClass('bg-light')
      expect(spectator.element).not.toHaveClass('bg-success')
    })
  })

  describe('with a form control', () => {
    it('is COMPLETE when control is valid and step isCurrent', () => {
      const control = new FormControl('value', Validators.required)
      render({ label: 'a', value: 'a', control, isCurrent: true })
      expect(spectator.element).toHaveClass('bg-success')
    })

    it('is COMPLETE when control is valid and step hasVisited', () => {
      const control = new FormControl('value', Validators.required)
      render({ label: 'a', value: 'a', control, hasVisited: true })
      expect(spectator.element).toHaveClass('bg-success')
    })

    it('is DEFAULT when control is valid but step was never visited', () => {
      const control = new FormControl('value', Validators.required)
      render({ label: 'a', value: 'a', control })
      expect(spectator.element).toHaveClass('bg-light')
    })

    it('is DEFAULT when control is invalid even if isCurrent', () => {
      const control = new FormControl('', Validators.required)
      render({ label: 'a', value: 'a', control, isCurrent: true })
      expect(spectator.element).toHaveClass('bg-light')
    })

    it('updates when the control status changes', () => {
      const control = new FormControl('', Validators.required)
      render({ label: 'a', value: 'a', control, isCurrent: true })
      expect(spectator.element).toHaveClass('bg-light')

      control.setValue('now valid')
      spectator.detectChanges()
      expect(spectator.element).toHaveClass('bg-success')
    })
  })

  describe('with neither completed nor control', () => {
    it('is DEFAULT', () => {
      render({ label: 'a', value: 'a' })
      expect(spectator.element).toHaveClass('bg-light')
    })
  })

  describe('switching step input', () => {
    it('stops reacting to the previous step control after the step input changes', () => {
      const oldControl = new FormControl('', Validators.required)
      render({ label: 'a', value: 'a', control: oldControl, isCurrent: true })
      expect(spectator.element).toHaveClass('bg-light')

      const newControl = new FormControl('value', Validators.required)
      spectator.setInput('step', {
        label: 'b',
        value: 'b',
        control: newControl,
        isCurrent: true,
      })
      spectator.detectChanges()
      expect(spectator.element).toHaveClass('bg-success')

      // Changing the OLD control must not flip state back.
      oldControl.setValue('anything')
      spectator.detectChanges()
      expect(spectator.element).toHaveClass('bg-success')
    })
  })
})
