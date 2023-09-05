import { componentWrapperDecorator, applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

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
  // render: args => ({
  //   props: {
  //     ...args,
  //     icon: faWrench,
  //   },
  //   template: `<seam-widget [icon]="icon" [titleText]="titleText">Widget Body</seam-widget>`,
  // }),
  // decorators: [
  //   componentWrapperDecorator(story => `<div class="position-absolute" style="height: 270px; width: 400px;">${story}</div>`),
  // ],
  // args: {
  //   // titleText: 'Example Widget',
  // },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamLoadingComponentHarness, { canvasElement, fixture })
    await expectFn(harness !== null).toBe(true)
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
        StoryLoadingServiceToggleComponent
      ],
    }),
    // componentWrapperDecorator(story => `<div class="position-relative" style="height: 270px; width: 400px;">${story}</div>`),
  ],
  parameters: {
    docs: {
      // iframeHeight: '300px',
      story: { inline: false, iframeHeight: '300px' }
    },
  },
  // args: {
  //   // titleText: 'Example Widget',
  // },
  // play: async ({ canvasElement, fixture }) => {
  //   // TODO: Button harness
  //   const harness = await getHarness(TheSeamWidgetHarness, { canvasElement, fixture })
  //   await expectFn(harness !== null).toBe(true)
  // },
}
