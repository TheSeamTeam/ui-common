import { moduleMetadata, Story } from '@storybook/angular'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '@theseam/ui-common/models'

import { BadgeButtonComponent } from './badge-button.component'

export default {
  title: 'Components/Buttons/BadgeButton',
  component: BadgeButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TheSeamButtonsModule
      ]
    })
  ]
}

export const Basic: Story = (args) => ({
  props: { ...args },
  template: `
    <button seamBadgeButton
      [theme]="theme"
      [badgeTheme]="badgeTheme"
      [badgeText]="badgeText"
      [size]="size">
      {{ btnText }}
    </button>
  `
})
Basic.argTypes = {
  btnText: {
    defaultValue: 'Example Text',
    control: { type: 'text' }
  },
  badgeText: {
    defaultValue: 'Badge Text',
    control: { type: 'text' }
  },
  theme: {
    defaultValue: 'primary',
    control: {
      type: 'select',
      options: ThemeNames
    }
  },
  badgeTheme: {
    defaultValue: 'danger',
    control: {
      type: 'select',
      options: ThemeNames
    }
  },
  size: {
    defaultValue: undefined,
    control: {
      type: 'select',
      options: [ undefined, 'sm', 'lg' ]
    }
  }
}
