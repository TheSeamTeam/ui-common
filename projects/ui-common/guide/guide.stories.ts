import { Component, inject, signal } from '@angular/core'
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'
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
        <div
          class="mt-3 p-3 border"
          seamGuideTarget="late"
          data-testid="late-target"
        >
          Appears later
        </div>
      }

      <div class="mt-3">
        <button type="button" class="btn btn-primary" (click)="runLate()">
          Start late-target guide
        </button>
        <button type="button" class="btn btn-link" (click)="showLate.set(true)">
          Reveal late target
        </button>
      </div>

      @if (showRecoverable()) {
        <div
          class="mt-3 p-3 border"
          seamGuideTarget="recoverable"
          data-testid="recoverable-target"
        >
          Recoverable target
        </div>
      }

      <div class="mt-3">
        <button
          type="button"
          class="btn btn-primary"
          (click)="runRecoverable()"
        >
          Start recoverable guide
        </button>
      </div>

      <div data-testid="recoverable-events">
        {{ recoverableEvents().join(',') }}
      </div>

      <div class="mt-3">
        <button
          type="button"
          class="btn btn-primary"
          seamGuideTarget="locked"
          (click)="runLocked()"
        >
          Start locked guide
        </button>
      </div>
    </div>
  `,
})
class GuideDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  readonly showLate = signal(false)
  readonly showRecoverable = signal(true)
  readonly recoverableEvents = signal<string[]>([])

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

  /**
   * Targets an element not yet in the DOM — exercises the "waits, then
   * paints" path. `targetTimeout` is raised well above the default so a play
   * function revealing the target has room to do so before the miss policy
   * would otherwise give up on it.
   */
  runLate(): void {
    this._guide.start({
      targetTimeout: 10000,
      steps: [
        {
          element: 'late',
          popover: {
            title: 'Late',
            description: 'Targets an element that is not rendered yet.',
          },
        },
      ],
    })
  }

  /**
   * Targets an element that is destroyed and recreated (a *different*
   * element registered under the same name) while this step is active —
   * exercises mid-step recovery.
   *
   * The destroy/recreate is driven by `setTimeout`, not a button click:
   * driver.js's overlay sets `pointer-events: none` on everything but the
   * highlighted element and its popover while a guide is active, so a real
   * user could not click a page button here either — this simulates an
   * external change (e.g. a data refresh re-rendering the target) instead.
   * `targetLostGrace` is raised well above the default so the timers have
   * comfortable room inside the grace window. `targetLost`/`targetRecovered`
   * are logged to `recoverableEvents` so the play function can assert on
   * them directly, in addition to the DOM outcome.
   */
  runRecoverable(): void {
    this.recoverableEvents.set([])
    this.showRecoverable.set(true)
    const ref = this._guide.start({
      targetLostGrace: 5000,
      steps: [
        {
          element: 'recoverable',
          popover: {
            title: 'Recoverable',
            description: 'This target is destroyed and recreated.',
          },
        },
      ],
    })
    ref.events$.subscribe((event) => {
      if (event.type === 'targetLost' || event.type === 'targetRecovered') {
        this.recoverableEvents.update((list) => [...list, event.type])
      }
    })
    setTimeout(() => this.showRecoverable.set(false), 300)
    setTimeout(() => this.showRecoverable.set(true), 800)
  }

  // A separate, non-dismissible guide on the same host component — kept here
  // rather than as its own component class because this Storybook version's
  // CSF3 types have no way to override `meta.component` on a per-story basis
  // (neither `StoryObj`'s fields nor `StoryFnAngularReturnType` include
  // `component`; only `Meta` does).
  runLocked(): void {
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

const meta: Meta<GuideDemoComponent> = {
  title: 'Guide/Guide',
  component: GuideDemoComponent,
  decorators: [
    applicationConfig({
      providers: [provideTheSeamGuide()],
    }),
  ],
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

    await waitFor(() =>
      expect(document.querySelector('.driver-popover-title')?.textContent).toBe(
        'Step two',
      ),
    )
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

export const NonDismissible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start locked guide' }),
    )

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )

    // driver.js always creates the close button element; only its visibility
    // is toggled by `allowClose`/`showButtons`, so assert it is hidden rather
    // than absent from the DOM.
    await expect(
      document.querySelector('.driver-popover-close-btn'),
    ).not.toBeVisible()

    // Escape is inert.
    await userEvent.keyboard('{Escape}')
    await expect(document.querySelector('.driver-popover')).toBeTruthy()
  },
}

export const LazilyRenderedTarget: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start late-target guide' }),
    )

    // The target does not exist yet, so the guide must wait rather than
    // paint a centered popover in its place.
    await expect(document.querySelector('.driver-popover')).toBeNull()

    await userEvent.click(
      canvas.getByRole('button', { name: 'Reveal late target' }),
    )

    await waitFor(() =>
      expect(document.querySelector('.driver-popover')).toBeTruthy(),
    )
    await expect(
      document.querySelector('.driver-popover-title')?.textContent,
    ).toBe('Late')
    await waitFor(() =>
      expect(
        document
          .querySelector('[data-testid="late-target"]')
          ?.classList.contains('driver-active-element'),
      ).toBe(true),
    )
  },
}

export const TargetDestroyedAndRecreated: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start recoverable guide' }),
    )

    await waitFor(() =>
      expect(
        document
          .querySelector('[data-testid="recoverable-target"]')
          ?.classList.contains('driver-active-element'),
      ).toBe(true),
    )

    // The component destroys the target ~300ms after start (see
    // `runRecoverable`'s doc comment for why this isn't a button click).
    await waitFor(
      () =>
        expect(
          document.querySelector('[data-testid="recoverable-events"]')
            ?.textContent,
        ).toContain('targetLost'),
      { timeout: 2000 },
    )
    // The old element is gone entirely, not merely hidden.
    await expect(
      document.querySelector('[data-testid="recoverable-target"]'),
    ).toBeNull()

    // The component recreates the target ~500ms later, as a *different*
    // element registered under the same name.
    await waitFor(
      () =>
        expect(
          document.querySelector('[data-testid="recoverable-events"]')
            ?.textContent,
        ).toContain('targetRecovered'),
      { timeout: 6000 },
    )
    // The popover ends up on the new element, not the destroyed one.
    await waitFor(() =>
      expect(
        document
          .querySelector('[data-testid="recoverable-target"]')
          ?.classList.contains('driver-active-element'),
      ).toBe(true),
    )
  },
}
