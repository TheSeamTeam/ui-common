import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '../../../buttons/index'
import { TheSeamIconModule } from '../../../icon/index'
import { ThemeNames } from '../../../models/theme-names'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Components|Widget/Content', module)
  .addDecorator(withKnobs)

  .add('Button Group', () => ({
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
          <seam-widget-button-group>
            <button seamButton theme="primary" size="sm">
              <seam-icon [icon]="faEnvelope"></seam-icon>
            </button>
          </seam-widget-button-group>
        </seam-widget>
      </div>`
  }))
