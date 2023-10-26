import { componentWrapperDecorator, applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'

import { provideAnimations } from '@angular/platform-browser/animations'
import { Component, inject } from '@angular/core'
import { Subject, interval, take, takeUntil } from 'rxjs'

import { faWrench } from '@fortawesome/free-solid-svg-icons'
import { expectFn, getHarness } from '@theseam/ui-common/testing'
import { TheSeamLoadingOverlayService } from '@theseam/ui-common/loading'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

import { TheSeamLoadingComponent } from './loading/loading.component'
import { TheSeamLoadingModule } from './loading.module'
import { TheSeamLoadingComponentHarness } from './testing/loading.harness'
import { waitOnConditionAsync } from '@theseam/ui-common/utils'

@Component({
  selector: 'story-loading-service-toggle',
  template: `
    <button seamButton theme="primary" (click)="toggleLoading()" class=".story-loading-toggle-btn">
      {{ _loadingService.enabled ? 'Loading...' : 'Show Loading' }}
    </button>
  `,
  imports: [ TheSeamButtonsModule ],
  standalone: true,
})
class StoryLoadingServiceToggleComponent {
  private readonly _ngUnsubscribe = new Subject<void>()
  readonly _loadingService = inject(TheSeamLoadingOverlayService)
  toggleLoading() {
    const show$ = interval(1000).pipe(take(1), takeUntil(this._ngUnsubscribe))
    this._loadingService.while(show$).subscribe()
  }
  ngOnDestroy() { this._ngUnsubscribe.next(); this._ngUnsubscribe.complete() }
}

const meta: Meta<TheSeamLoadingComponent> = {
  title: 'Loading/Components',
  component: TheSeamLoadingComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamLoadingModule,
      ],
    }),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<TheSeamLoadingComponent>

export const Basic: Story = {
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamLoadingComponentHarness, { canvasElement, fixture })
    await expect(await harness.getTheme()).toBe('default')
  },
}

export const Primary: Story = {
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamLoadingComponentHarness, { canvasElement, fixture })
    await expect(await harness.getTheme()).toBe('primary')
  },
  args: {
    theme: 'primary',
  },
}

export const Service: Story = {
  render: args => ({
    props: args,
    template: `<story-loading-service-toggle></story-loading-service-toggle>`,
  }),
  decorators: [
    moduleMetadata({
      imports: [
        StoryLoadingServiceToggleComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: '300px' },
    },
  },
  play: async ({ canvasElement, fixture }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Show Loading'))
    const harness = await getHarness(TheSeamLoadingComponentHarness, { canvasElement: canvasElement.getRootNode() as HTMLElement, fixture })
    await expect(await harness.getTheme()).toBe('default')
  },
}
