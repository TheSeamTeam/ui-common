import { Component, inject, signal } from '@angular/core'
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import { TheSeamGuideTargetDirective } from './target/guide-target.directive'

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    <div class="p-4">
      <button
        type="button"
        class="btn btn-primary"
        seamGuideTarget="start"
        (click)="run()"
      >
        Start guide
      </button>

      <div class="mt-3 p-3 border" seamGuideTarget="panel">
        A panel to highlight
      </div>

      @if (showLate()) {
        <div class="mt-3 p-3 border" seamGuideTarget="late">Appears later</div>
      }

      <button type="button" class="btn btn-link" (click)="showLate.set(true)">
        Reveal late target
      </button>
    </div>
  `,
})
class GuideDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  readonly showLate = signal(false)

  run(): void {
    this._guide.start({
      steps: [
        {
          element: 'start',
          popover: { title: 'Step one', description: 'This starts it.' },
        },
        {
          element: 'panel',
          popover: { title: 'Step two', description: 'A highlighted panel.' },
        },
        {
          popover: {
            title: 'Step three',
            description: 'No element — a centered popover.',
          },
        },
      ],
    })
  }
}

const meta: Meta<GuideDemoComponent> = {
  title: 'Guide/Guide',
  component: GuideDemoComponent,
  decorators: [moduleMetadata({ providers: [provideTheSeamGuide()] })],
}

export default meta
type Story = StoryObj<GuideDemoComponent>

export const MultiStepWalkthrough: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )
    await expect(
      document.querySelector('.driver-popover-title')?.textContent,
    ).toBe('Step one')
  },
}

export const ElementlessStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )

    const next = () =>
      document.querySelector<HTMLElement>('.driver-popover-next-btn')
    await userEvent.click(next()!)
    await userEvent.click(next()!)

    await waitFor(() =>
      expect(document.querySelector('.driver-popover-title')?.textContent).toBe(
        'Step three',
      ),
    )
  },
}

export const FocusMovesIntoThePopover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )
    await waitFor(() =>
      expect(
        document
          .querySelector('.driver-popover')
          ?.contains(document.activeElement),
      ).toBe(true),
    )
  },
}

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    <div class="p-4">
      <button
        type="button"
        class="btn btn-primary"
        seamGuideTarget="locked"
        (click)="run()"
      >
        Start locked guide
      </button>
    </div>
  `,
})
class LockedGuideDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  run(): void {
    this._guide.start({
      dismissible: false,
      onMissingTarget: 'end',
      steps: [
        {
          element: 'locked',
          popover: {
            title: 'Required',
            description: 'Escape will not close this.',
          },
        },
      ],
    })
  }
}

export const NonDismissible: StoryObj<LockedGuideDemoComponent> = {
  render: () => ({ component: LockedGuideDemoComponent }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start locked guide' }),
    )

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )

    // No close button is rendered.
    await expect(document.querySelector('.driver-popover-close-btn')).toBeNull()

    // Escape is inert.
    await userEvent.keyboard('{Escape}')
    await expect(document.querySelector('.driver-popover')).toBeTruthy()
  },
}
