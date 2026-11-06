import { Component, inject } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Modal, TheSeamModalModule } from '@theseam/ui-common/modal'

import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import { TheSeamGuideTargetDirective } from './target/guide-target.directive'

/**
 * A modal taller than the screen, opened through the `Modal` service so it
 * has the focus trap a real modal has. The guide button in the header is the
 * first tabbable element, so it is where the trap would send focus.
 */
@Component({
  standalone: true,
  imports: [TheSeamModalModule, TheSeamGuideTargetDirective],
  template: `
    <seam-modal-header>
      <h4 seamModalTitle>Long modal</h4>
      <button
        type="button"
        class="btn btn-link"
        seamGuideTarget="modal-guide-button"
        (click)="runGuide()"
      >
        Show guide
      </button>
    </seam-modal-header>
    <seam-modal-body>
      <div style="height: 3000px" class="border p-3">
        Content taller than the screen.
      </div>
      <button
        type="button"
        class="btn btn-primary"
        seamGuideTarget="modal-apply"
        data-testid="modal-apply"
      >
        Apply
      </button>
    </seam-modal-body>
  `,
})
class GuideLongModalComponent {
  private readonly _guide = inject(TheSeamGuideService)

  runGuide(): void {
    this._guide.start({
      steps: [
        {
          element: 'modal-guide-button',
          popover: { title: 'Guide', description: 'Starts this guide.' },
        },
        {
          element: 'modal-apply',
          popover: { title: 'Apply', description: 'Far below the fold.' },
        },
      ],
    })
  }
}

@Component({
  standalone: true,
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-primary" (click)="open()">
        Open long modal
      </button>
    </div>
  `,
})
class GuideOverModalDemoComponent {
  private readonly _modal = inject(Modal)

  open(): void {
    this._modal.openFromComponent(GuideLongModalComponent)
  }
}

const meta: Meta<GuideOverModalDemoComponent> = {
  title: 'Guide/Guide Over Modal',
  component: GuideOverModalDemoComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideTheSeamGuide()],
    }),
  ],
}

export default meta
type Story = StoryObj<GuideOverModalDemoComponent>

/**
 * The modal's focus trap must not pull focus back to the header while the
 * guide's popover, which sits outside the modal, has it. If it does, the
 * browser scrolls the header into view and the highlighted Apply button is
 * left off screen.
 */
export const StepBelowTheFold: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open long modal' }),
    )

    const body = within(document.body)
    await userEvent.click(
      await body.findByRole('button', { name: 'Show guide' }),
    )
    await waitFor(() =>
      expect(document.querySelector('.driver-popover-title')?.textContent).toBe(
        'Guide',
      ),
    )

    await userEvent.click(
      document.querySelector<HTMLElement>('.driver-popover-next-btn')!,
    )
    await waitFor(() =>
      expect(document.querySelector('.driver-popover-title')?.textContent).toBe(
        'Apply',
      ),
    )

    // The trap moves focus on a timeout. Give it time to have done so.
    await new Promise((resolve) => setTimeout(resolve, 500))

    const apply = body.getByTestId('modal-apply').getBoundingClientRect()
    await expect(apply.top).toBeGreaterThanOrEqual(0)
    await expect(apply.bottom).toBeLessThanOrEqual(window.innerHeight)
    await expect(
      document
        .querySelector('.driver-popover')
        ?.contains(document.activeElement),
    ).toBe(true)
  },
}
