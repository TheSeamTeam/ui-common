import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { ButtonComponent, TheSeamButtonsModule } from '@theseam/ui-common/buttons'

export default {
  title: 'Buttons/Components/Button',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TheSeamButtonsModule
      ]
    }),
    componentWrapperDecorator(story => `<div class="vh-100 vw-100">${story}</div>`)
  ]
} as Meta

export const Basic: Story<Partial<ButtonComponent> & { [key: string]: any }> = (args) => ({
  props: { ...args },
  template: `
    <button seamButton
      [theme]="theme"
      [size]="size"
      [type]="type"
    >{{ btnText }}</button>
  `
})
Basic.args = {
  btnText: 'Example fText',
  theme: 'primary'
}
Basic.argTypes = {
  btnText: {
    control: { type: 'text' },
  },
  theme: themeWithOutlineArgType,
  size: sizeArgType,
  type: buttonTypeArgType
}
