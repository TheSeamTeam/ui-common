import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { TheSeamPhoneNumberPipe } from './phone-number.pipe'

console.log('TheSeamPhoneNumberPipe', TheSeamPhoneNumberPipe)

export default {
  title: 'Pipes/PhoneNumber',
  decorators: [
    moduleMetadata({ declarations: [ TheSeamPhoneNumberPipe ] })
  ]
} as Meta

export const Basic: Story = (args) => ({
  template: `[{{ phone }}]  {{ phone | phoneNumber }}`,
  props: args
})
Basic.args = {
  phone: '9015555555'
}
