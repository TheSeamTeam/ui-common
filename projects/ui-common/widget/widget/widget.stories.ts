import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../widget.module'
import { WidgetComponent } from './widget.component'

export default {
  title: 'Widget/Components',
  component: WidgetComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamWidgetModule
      ]
    }),
    componentWrapperDecorator(story => `<div class="p-4" style="height: 270px; width: 500px;">${story}</div>`)
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
} as Meta

export const Simple: Story = (args) => ({
  props: {
    ...args,
    icon: faWrench,
  },
  template: `<seam-widget>Widget Body</seam-widget>`
})
Simple.args = {
  titleText: 'Example Widget'
}

export const FAIcon: Story = (args) => ({
  props: {
    ...args,
    icon: faWrench,
  },
  template: `<seam-widget>Widget Body</seam-widget>`
})
FAIcon.args = {
  titleText: 'Example Widget'
}

export const ImageIcon: Story = (args) => ({
  props: {
    ...args,
    icon: 'assets/images/icons8-pass-fail-32.png'
  },
  template: `<seam-widget>Widget Body</seam-widget>`
})
ImageIcon.args = {
  titleText: 'Example Widget'
}

export const TitleTemplate: Story = (args) => ({
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
    </seam-widget>`
})
TitleTemplate.args = {
  titleText: 'Example Widget'
}

export const IconTemplate: Story = (args) => ({
  props: { ...args },
  template: `
    <seam-widget>
      <ng-template seamWidgetIconTpl>
        <span class="border border-danger">
          <img src="assets/images/icons8-pass-fail-32.png">
        </span>
      </ng-template>
      Widget Body
    </seam-widget>`
})
IconTemplate.args = {
  titleText: 'Example Widget'
}

export const Loading: Story = (args) => ({
  props: {
    ...args,
    icon: faWrench
  },
  template: `
    <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
      Widget Body
    </seam-widget>`
})
Loading.args = {
  loading: true
}

export const NoHeader: Story = (args) => ({
  props: { ...args },
  template: `<seam-widget>Widget Body</seam-widget>`
})
NoHeader.args = {
  hasHeader: false
}
