import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamWidgetModule } from '../widget.module'
import { WidgetComponent } from './widget.component'
import { TheSeamWidgetHarness } from '../testing/widget.harness'

const meta: Meta<WidgetComponent> = {
  title: 'Widget/Components',
  component: WidgetComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
      ],
    }),
    componentWrapperDecorator(story => `<div style="height: 270px; width: 400px;">${story}</div>`),
  ],
  // parameters: {
  //   docs: {
  //     story: {
  //       iframeHeight: '200px',
  //     },
  //   },
  // },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<WidgetComponent>

export const Simple: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `<seam-widget [icon]="icon" [titleText]="titleText">Widget Body</seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamWidgetHarness, { canvasElement, fixture })
    await expectFn(harness !== null).toBe(true)
  },
}

export const FAIcon: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `<seam-widget [icon]="icon" [titleText]="titleText">Widget Body</seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamWidgetHarness, { canvasElement, fixture })
    await expectFn(harness !== null).toBe(true)
  },
}

export const ImageIcon: Story = {
  render: args => ({
    props: {
      ...args,
      icon: 'assets/images/icons8-pass-fail-32.png',
    },
    template: `<seam-widget [icon]="icon" [titleText]="titleText">Widget Body</seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
}

export const TitleTemplate: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <seam-widget [icon]="icon" [titleText]="titleText">
        <ng-template seamWidgetTitleTpl>
          {{ titleText }}
          <span class="badge float-right text-light badge-success">
            complete
          </span>
        </ng-template>
        Widget Body
      </seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
}

export const IconTemplate: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-widget [titleText]="titleText">
        <ng-template seamWidgetIconTpl>
          <span class="border border-danger">
            <img src="assets/images/icons8-pass-fail-32.png">
          </span>
        </ng-template>
        Widget Body
      </seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
}

export const Loading: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
        Widget Body
      </seam-widget>`,
  }),
  args: {
    loading: true,
  },
}

export const NoHeader: Story = {
  render: args => ({
    props: args,
    template: `<seam-widget [hasHeader]="hasHeader">Widget Body</seam-widget>`,
  }),
  args: {
    hasHeader: false,
  },
}

export const Collapse: Story = {
  render: args => ({
    props: args,
    template: `<seam-widget [canCollapse]="canCollapse">Widget Body</seam-widget>`,
  }),
  args: {
    canCollapse: true,
  },
}
