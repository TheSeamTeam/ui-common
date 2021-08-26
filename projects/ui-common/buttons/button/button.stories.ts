import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { ButtonComponent } from './button.component'

import { ToggleButtonComponent } from '../toggle-button/toggle-button.component'

export default {
  title: 'Buttons/Components/Button',
  component: ButtonComponent,
  subcomponents: {
    ToggleButtonComponent
  },
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
    <button seamButton
      [theme]="theme"
      [size]="size"
      [type]="type">
      {{ btnText }}
    </button>
    <button seamToggleButton
      [theme]="theme"
      [size]="size"
      [type]="type">
      {{ btnText }}
    </button>
  `
})
Basic.args = {
  btnText: 'Example Text'
}
Basic.argTypes = {
  btnText: {
    control: { type: 'text' },
  },
  theme: themeWithOutlineArgType,
  size: sizeArgType,
  type: buttonTypeArgType
}
