import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '@lib/ui-common/models'

import { BadgeButtonComponent } from './badge-button.component'

storiesOf('Components/Buttons/BadgeButton', module)
  .addDecorator(withKnobs)
  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        BadgeButtonComponent
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule
      ]
    },
    props: {
      btnText: text('Button Text', 'Example Text'),
      badgeText: text('Badge Text', 'Badge Text'),
      btnTheme: select('Button Theme', ThemeNames, 'lightgray'),
      badgeTheme: select('Badge Theme', ThemeNames, 'primary'),
      size: select('Size', { 'undefined': '', sm: 'sm', lg: 'lg' }, '')
    },
    template: `
      <div class="p-5">
        <button seamBadgeButton
          [theme]="btnTheme"
          [badgeTheme]="badgeTheme"
          [badgeText]="badgeText"
          [size]="size">
          {{ btnText }}
        </button>
      </div>
    `
  }))
