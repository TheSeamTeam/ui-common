import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Widget/Content', module)
  .addDecorator(withKnobs)

  .add('Empty Label', () => ({
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
      emptyLabelText: text('Empty Label Text', 'Empty Label Text'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-empty-label>{{ emptyLabelText }}</seam-widget-empty-label>
        </seam-widget>
      </div>`
  }))