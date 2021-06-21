import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
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
} as Meta

export const Basic: Story = (args) => ({
  props: { ...args },
  template: `
    <button seamBadgeButton
      [theme]="theme"
      [badgeTheme]="badgeTheme"
      [badgeText]="badgeText"
      [size]="size"
      [type]="type">
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
  theme: themeWithOutlineArgType,
  badgeTheme: themeWithOutlineArgType,
  size: sizeArgType,
  type: buttonTypeArgType
}
