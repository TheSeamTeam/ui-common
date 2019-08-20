import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../widget.module'

storiesOf('Widget', module)
  .addDecorator(withKnobs)

  .add('Simple', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false)
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          Widget Body
        </seam-widget>
      </div>`
  }))

  .add('FontAwesome Icon', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget">
          Widget Body
        </seam-widget>
      </div>`
  }))

  .add('Image Icon', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: 'assets/images/icons8-pass-fail-32.png'
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget">
          Widget Body
        </seam-widget>
      </div>`
  }))

  .add('Title Template', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
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
  }))

  .add('Icon Template', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: { },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-widget titleText="Example Widget">
          <ng-template seamWidgetIconTpl>
            <span class="border border-danger">
              <img src="assets/images/icons8-pass-fail-32.png">
            </span>
          </ng-template>
          Widget Body
        </seam-widget>
      </div>`
  }))
