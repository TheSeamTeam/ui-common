import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { TheSeamPhoneNumberPipe } from './phone-number.pipe'

const meta: Meta<any> = {
  title: 'Pipes/PhoneNumber',
  decorators: [
    moduleMetadata({ declarations: [ TheSeamPhoneNumberPipe ] }),
  ],
}

export default meta
type Story = StoryObj<any>

export const Basic: Story = {
  render: args => ({
    template: `[{{ phone }}]  {{ phone | phoneNumber }}`,
    props: args,
  }),
  args: {
    phone: '9015555555',
  },
}
