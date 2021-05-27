import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { ToggleButtonComponent } from './toggle-button.component'

export default {
  title: 'Components/Buttons/ToggleButton',
  component: ToggleButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        TheSeamButtonsModule
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: { ...args },
  template: `
    <button seamToggleButton
      [theme]="theme"
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
  theme: themeWithOutlineArgType,
  badgeTheme: themeWithOutlineArgType,
  size: sizeArgType,
  type: buttonTypeArgType
}
