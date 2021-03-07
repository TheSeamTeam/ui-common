import { boolean, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@lib/ui-common/buttons'
import { TheSeamIconModule } from '@lib/ui-common/icon'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Components/Widget/Content', module)
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
