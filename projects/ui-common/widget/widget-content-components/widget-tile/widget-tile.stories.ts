import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faPersonBooth, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Components/Widget/Content/Tile', module)
  .addDecorator(withKnobs)

  .add('Link', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      tileIcon: faPersonBooth,
      tileText: text('Tile Text', 'Tile Text'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <a seam-widget-tile [icon]="tileIcon" routerLink="/data-tools">
            {{ tileText }}
          </a>
          <a seam-widget-tile [icon]="tileIcon" routerLink="/data-tools" disabled>
            {{ tileText }} [disabled]
          </a>
        </seam-widget>
      </div>`
  }))

  .add('Button', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      tileIcon: faPersonBooth,
      tileText: text('Tile Text', 'Tile Text'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <button seam-widget-tile [icon]="tileIcon">{{ tileText }}</button>
          <button seam-widget-tile [icon]="tileIcon" disabled>{{ tileText }} [disabled]</button>
        </seam-widget>
      </div>`
  }))

  .add('Button With Footer', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      tileIcon: faPersonBooth,
      tileText: text('Tile Text', 'Tile Text'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <button seam-widget-tile [icon]="tileIcon">tile 1</button>
          <seam-widget-tile-group>
            <button seam-widget-tile [icon]="tileIcon">{{ tileText }}</button>
            <seam-widget-tile-footer>
              <button seam-widget-tile-footer-item>Item 1</button>
              <a seam-widget-tile-footer-item>Item 2</a>
              <a seam-widget-tile-footer-item href="https://theseamteam.github.io/ui-common">Item 3</a>
            </seam-widget-tile-footer>
          </seam-widget-tile-group>
        </seam-widget>
      </div>`
  }))
