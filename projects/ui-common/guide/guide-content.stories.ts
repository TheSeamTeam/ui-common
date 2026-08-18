import {
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core'
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import {
  TheSeamGuideContentContext,
  THE_SEAM_GUIDE_CONTENT,
} from './models/guide-content'
import { TheSeamGuideTargetDirective } from './target/guide-target.directive'

@Component({
  selector: 'seam-app-popover-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="d-flex align-items-center">
      <span aria-hidden="true" class="mr-2" data-testid="chrome-icon">{{
        _ctx.data['icon']
      }}</span>
      <strong data-testid="chrome-text">{{ _ctx.text }}</strong>
      <small class="ml-2 text-muted" data-testid="chrome-progress">
        {{ _ctx.index + 1 }}/{{ _ctx.total }}
      </small>
    </span>
  `,
})
class AppPopoverTitleComponent {
  readonly _ctx = inject(THE_SEAM_GUIDE_CONTENT)
}

@Component({
  selector: 'seam-step-popover-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<strong data-testid="step-title-text">{{ _ctx.text }}</strong>`,
})
class StepPopoverTitleComponent {
  readonly _ctx = inject(THE_SEAM_GUIDE_CONTENT)
}

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">
      <button
        type="button"
        class="btn btn-primary"
        seamGuideTarget="one"
        (click)="runChrome()"
      >
        Start chrome guide
      </button>

      <div class="mt-3 p-3 border" seamGuideTarget="two">A second target</div>

      <div class="mt-3">
        <button type="button" class="btn btn-primary" (click)="runTemplate()">
          Start template guide
        </button>
      </div>

      <div class="mt-3">
        <button
          type="button"
          class="btn btn-primary"
          (click)="runStepOverride()"
        >
          Start step-override guide
        </button>
      </div>

      <ng-template #tpl let-d let-text="text" let-i="index" let-n="total">
        <div data-testid="tpl-body">
          <p>{{ text }}</p>
          <p data-testid="tpl-detail">
            {{ d['detail'] }} ({{ i + 1 }}/{{ n }})
          </p>
        </div>
      </ng-template>
    </div>
  `,
})
class GuideContentDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  readonly tpl =
    viewChild.required<TemplateRef<TheSeamGuideContentContext>>('tpl')

  /** Both steps supply only a string; the provider layer supplies the look. */
  runChrome(): void {
    this._guide.start({
      steps: [
        { element: 'one', popover: { title: 'Step One', description: 'One.' } },
        { element: 'two', popover: { title: 'Step Two', description: 'Two.' } },
      ],
    })
  }

  runTemplate(): void {
    this._guide.start({
      steps: [
        {
          element: 'one',
          popover: {
            title: 'Templated',
            description: {
              template: this.tpl(),
              text: 'Body from a template',
              data: { detail: 'with step data' },
            },
          },
        },
      ],
    })
  }

  /** A step-level component replaces the provider's title chrome outright. */
  runStepOverride(): void {
    this._guide.start({
      steps: [
        {
          element: 'one',
          popover: {
            title: { component: StepPopoverTitleComponent, text: 'Step title' },
            description: 'Step-level override.',
          },
        },
      ],
    })
  }
}

const meta: Meta<GuideContentDemoComponent> = {
  title: 'Guide/Guide Content',
  component: GuideContentDemoComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideTheSeamGuide({
          popover: {
            title: {
              component: AppPopoverTitleComponent,
              data: { icon: '★' },
            },
          },
        }),
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<GuideContentDemoComponent>

const titleEl = () =>
  document.querySelector<HTMLElement>('.driver-popover-title')
const descEl = () =>
  document.querySelector<HTMLElement>('.driver-popover-description')

export const ProviderChromeOnAStringStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start chrome guide' }),
    )

    await waitFor(() => expect(titleEl()).toBeTruthy())

    // Visibility, not just presence: driver.js hides a slot whose string is
    // falsy, and an element slot passes no string.
    await expect(titleEl()!.style.display).toBe('block')
    await expect(
      titleEl()!.querySelector('[data-testid="chrome-icon"]')?.textContent,
    ).toBe('★')
    await expect(
      titleEl()!.querySelector('[data-testid="chrome-text"]')?.textContent,
    ).toBe('Step One')
    await expect(
      titleEl()!
        .querySelector('[data-testid="chrome-progress"]')
        ?.textContent?.trim(),
    ).toBe('1/2')
    await expect(descEl()!.textContent).toBe('One.')
  },
}

export const ChromeSurvivesNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start chrome guide' }),
    )
    await waitFor(() => expect(titleEl()).toBeTruthy())

    await userEvent.click(
      document.querySelector<HTMLElement>('.driver-popover-next-btn')!,
    )

    await waitFor(() =>
      expect(
        titleEl()?.querySelector('[data-testid="chrome-text"]')?.textContent,
      ).toBe('Step Two'),
    )
    await expect(
      titleEl()!
        .querySelector('[data-testid="chrome-progress"]')
        ?.textContent?.trim(),
    ).toBe('2/2')
    // Visibility, not just presence, on the *post-navigation* paint: clicking
    // Next tears down and rebuilds the whole popover, so `onPopoverRender`
    // must re-fire and re-apply `display: block` on the new DOM. `textContent`
    // assertions alone pass identically whether this element is visible or
    // `display: none`, so without this check the story cannot catch a
    // regression in the one thing it's named for.
    await expect(titleEl()!.style.display).toBe('block')
    // driver.js wires aria-labelledby (and the title's id) unconditionally on
    // every popover build, so on its own this only detects driver.js changing
    // its own markup — the title is the direct target of aria-labelledby, so
    // its text feeds the accessible name whether or not it's visible, and
    // visibility is not what this assertion protects. Together the three
    // assertions above pin what this story is actually for: after a
    // re-render, the title slot is still visible to a sighted user, still
    // non-empty, and still wired to the dialog by id.
    await expect(
      document
        .querySelector('.driver-popover')
        ?.getAttribute('aria-labelledby'),
    ).toBe('driver-popover-title')
  },
}

export const StepComponentOverridesProviderChrome: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start step-override guide' }),
    )

    await waitFor(() =>
      expect(
        titleEl()?.querySelector('[data-testid="step-title-text"]'),
      ).toBeTruthy(),
    )
    // The step's component replaces the provider's title chrome outright —
    // none of the provider's markup should be present alongside it.
    await expect(
      titleEl()!.querySelector('[data-testid="chrome-icon"]'),
    ).toBeNull()
    await expect(
      titleEl()!.querySelector('[data-testid="step-title-text"]')?.textContent,
    ).toBe('Step title')
    // Visibility, not just presence — the property this story family exists
    // to protect.
    await expect(titleEl()!.style.display).toBe('block')
    await expect(descEl()!.textContent).toBe('Step-level override.')
  },
}

export const TemplateDescription: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start template guide' }),
    )

    await waitFor(() =>
      expect(descEl()?.querySelector('[data-testid="tpl-body"]')).toBeTruthy(),
    )
    await expect(descEl()!.style.display).toBe('block')
    // Prettier wraps this paragraph's interpolations across lines, and
    // Angular's default whitespace handling turns that line break into a
    // real space in `textContent`, hence the trim (as with chrome-progress
    // above).
    await expect(
      descEl()!
        .querySelector('[data-testid="tpl-detail"]')
        ?.textContent?.trim(),
    ).toBe('with step data (1/1)')
    // The step's own string still reaches the template as `text`.
    await expect(descEl()!.textContent).toContain('Body from a template')
  },
}
