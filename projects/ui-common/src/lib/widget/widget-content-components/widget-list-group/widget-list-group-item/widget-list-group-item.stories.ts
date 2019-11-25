import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faPuzzlePiece, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '../../../../buttons/index'
import { TheSeamIconModule } from '../../../../icon/index'
import { ThemeNames } from '../../../../models/theme-names'

import { TheSeamWidgetModule } from '../../../widget.module'

storiesOf('Components/Widget/Content/List Group/Item', module)
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
            <seam-widget-list-group-item label="Item 1"></seam-widget-list-group-item>
            <seam-widget-list-group-item label="Item 2"></seam-widget-list-group-item>
            <seam-widget-list-group-item label="Item 3"></seam-widget-list-group-item>
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
            <a seamWidgetListGroupItem label="Item 1">Item 1</a>
            <a seamWidgetListGroupItem label="Item 2">Item 2</a>
            <a seamWidgetListGroupItem label="Item 3">Item 3</a>
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
            <button seamWidgetListGroupItem label="Item 1">Item 1</button>
            <button seamWidgetListGroupItem label="Item 2">Item 2</button>
            <button seamWidgetListGroupItem label="Item 3">Item 3</button>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))

storiesOf('Components/Widget/Content/List Group/Item/Content', module)
  .addDecorator(withKnobs)

  .add('Label Only', () => ({
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
      faEnvelope: faEnvelope,
      label: 'Example Label'
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-list-group>
            <seam-widget-list-group-item [label]="label"></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))

  .add('Icon With Label', () => ({
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
      faEnvelope: faEnvelope,
      label: 'Example Label',
      itemIcon: faPuzzlePiece
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-list-group>
            <seam-widget-list-group-item [icon]="itemIcon" [label]="label"></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`
  }))
