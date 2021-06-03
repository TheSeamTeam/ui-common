import { action } from '@storybook/addon-actions'
// import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Components/Widget/Content', module)
  // .addDecorator(withKnobs)

  .add('Footer Link', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    },
    props: {
      icon: faWrench,
      // title: text('Header Title', 'Example Widget'),
      // loading: boolean('Loading', false),
      // footerText: text('Footer Text', 'See All'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <a seam-widget-footer-link routerLink="/messages">{{ footerText }}</a>
        </seam-widget>
      </div>`
  }))
