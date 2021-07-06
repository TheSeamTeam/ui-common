import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { ProgressCircleButtonComponent } from './progress-circle-button.component'

export default {
  title: 'Buttons/Components/ProgressCircleButton',
  component: ProgressCircleButtonComponent,
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
    <button seamProgressCircleButton
      theme="{{ theme }}"
      [size]="size"
      [type]="type"
      [fillBackground]="fillBackground"
      [showText]="showText"
      [hiddenOnEmpty]="hiddenOnEmpty"
      [percentage]="percentage">
      {{ btnText }}
    </button>
  `
})
Basic.argTypes = {
  btnText: {
    defaultValue: 'Percentage Button',
    control: { type: 'text' }
  },
  percentage: {
    defaultValue: 60,
    control: { type: 'range', min: 0, max: 100, step: 1 },
  },
  theme: { ...themeWithOutlineArgType, defaultValue: 'outline-primary' },
  size: sizeArgType,
  type: buttonTypeArgType,
}
