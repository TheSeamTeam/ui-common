import { moduleMetadata } from '@storybook/angular'

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
    // withKnobs
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
}

export const Simple = () => ({
  props: {
    icon: faWrench,
    // title: text('Header Title', 'Example Widget'),
    // loading: boolean('Loading', false)
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
        Widget Body
      </seam-widget>
    </div>`
})

Simple.story = {
  name: 'Simple'
}

export const FAIcon = () => ({
  props: {
    icon: faWrench,
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget">
        Widget Body
      </seam-widget>
    </div>`
})

FAIcon.story = {
  name: 'FontAwesome Icon'
}

export const ImageIcon = () => ({
  props: {
    icon: 'assets/images/icons8-pass-fail-32.png'
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget">
        Widget Body
      </seam-widget>
    </div>`
})

ImageIcon.story = {
  name: 'Image Icon'
}

export const TitleTemplate = () => ({
  props: {
    icon: faWrench,
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [icon]="icon">
        <ng-template seamWidgetTitleTpl>
          Example Widget
          <span class="badge float-right text-light badge-success">
            complete
          </span>
        </ng-template>
        Widget Body
      </seam-widget>
    </div>`
})

TitleTemplate.story = {
  name: 'Title Template'
}

export const IconTemplate = () => ({
  props: { },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget titleText="Example Widget">
        <ng-template seamWidgetIconTpl>
          <span class="border border-danger">
            <img src="assets/images/icons8-pass-fail-32.png">
          </span>
        </ng-template>
        Widget Body
      </seam-widget>
    </div>`
})

IconTemplate.story = {
  name: 'Icon Template'
}

export const Loading = () => ({
  props: {
    icon: faWrench,
    // title: text('Header Title', 'Example Widget'),
    // loading: boolean('Loading', true)
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
        Widget Body
      </seam-widget>
    </div>`
})

Loading.story = {
  name: 'Loading'
}

export const NoHeader = () => ({
  props: {
    // loading: boolean('Loading', false)
  },
  template: `
    <div class="p-4" style="height: 270px; width: 500px;">
      <seam-widget [hasHeader]="false" [loading]="loading">
        Widget Body
      </seam-widget>
    </div>`
})

NoHeader.story = {
  name: 'No Header'
}
