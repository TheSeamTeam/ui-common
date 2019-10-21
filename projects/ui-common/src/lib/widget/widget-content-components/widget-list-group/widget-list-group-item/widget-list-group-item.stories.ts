import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '../../../../buttons/index'
import { TheSeamIconModule } from '../../../../icon/index'
import { ThemeNames } from '../../../../models/theme-names'

import { TheSeamWidgetModule } from '../../../widget.module'

storiesOf('Widget/Content/List Group/Item', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      faEnvelope: faEnvelope
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-list-group>
            <seam-widget-list-group-item>Item 1</seam-widget-list-group-item>
            <seam-widget-list-group-item>Item 2</seam-widget-list-group-item>
            <seam-widget-list-group-item>Item 3</seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))

  .add('Link', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      faEnvelope: faEnvelope
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-list-group>
            <a seamWidgetListGroupItem>Item 1</a>
            <a seamWidgetListGroupItem>Item 2</a>
            <a seamWidgetListGroupItem>Item 3</a>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))

  .add('Button', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      faEnvelope: faEnvelope
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-list-group>
            <button seamWidgetListGroupItem>Item 1</button>
            <button seamWidgetListGroupItem>Item 2</button>
            <button seamWidgetListGroupItem>Item 3</button>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))
