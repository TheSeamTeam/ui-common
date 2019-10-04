import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Widget/Content', module)
  .addDecorator(withKnobs)

  .add('Description', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),
      // tslint:disable-next-line:max-line-length
      descText: text('Description Text', 'Sharing your enrollment with the merchants and coops who you deal with allows them to better market your cotton.  To add additional entities to share with, click the "Modify/Add Additional" link below, then click the "Share+" button at the bottom of your screen'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-description>{{ descText }}</seam-widget-description>
        </seam-widget>
      </div>`
  }))
