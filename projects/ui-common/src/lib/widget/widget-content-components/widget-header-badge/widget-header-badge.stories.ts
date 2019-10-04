import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { ThemeNames } from '../../../models/theme-names'
import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Widget/Content', module)
  .addDecorator(withKnobs)

  .add('Header Badge', () => ({
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
      headerBadgeText: text('Header Badge Text', 'Badge'),
      badgeTheme: select('Badge Theme', ThemeNames, 'primary')
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [loading]="loading">
          <ng-template seamWidgetTitleTpl>
            {{ title }}
            <seam-widget-header-badge [theme]="badgeTheme">
              {{ headerBadgeText }}
            </seam-widget-header-badge>
          </ng-template>
        </seam-widget>
      </div>`
  }))
