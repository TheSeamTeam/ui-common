import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../widget.module'
import { WidgetComponent } from './widget.component'

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
    componentWrapperDecorator(story => `<div class="p-4" style="height: 270px; width: 500px;">${story}</div>`),
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    },
  },
}

export default meta
type Story = StoryObj<WidgetComponent>

export const Simple: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `<seam-widget>Widget Body</seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
}

export const FAIcon: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `<seam-widget>Widget Body</seam-widget>`,
  }),
  args: {
    titleText: 'Example Widget',
  },
}

export const ImageIcon: Story = {
  render: args => ({
    props: {
      ...args,
      icon: 'assets/images/icons8-pass-fail-32.png',
    },
    template: `<seam-widget>Widget Body</seam-widget>`,
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
      <seam-widget>
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
    props: { ...args },
    template: `
      <seam-widget>
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
    props: { ...args },
    template: `<seam-widget [hasHeader]="hasHeader">Widget Body</seam-widget>`,
  }),
  args: {
    hasHeader: false,
  },
}

export const CanCollapse: Story = {
  render: args => ({
    props: { ...args },
    template: `<seam-widget [canCollapse]="canCollapse">Widget Body</seam-widget>`,
  }),
  args: {
    canCollapse: true,
  },
}
