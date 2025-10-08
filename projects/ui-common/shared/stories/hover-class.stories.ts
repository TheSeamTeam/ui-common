import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { NgIf } from '@angular/common'

import { TheSeamHoverClassDirective } from '../directives/hover-class.directive'

interface StoryExtraProps { }

const meta: Meta<TheSeamHoverClassDirective & StoryExtraProps> = {
  title: 'Shared/HoverClass',
  component: TheSeamHoverClassDirective,
  decorators: [
    moduleMetadata({
      imports: [
        NgIf,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamHoverClassDirective & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: { ...args },
    template: `<div style="padding: 25px;" class="text-center bg-primary" seamHoverClass="bg-success">Hover me</div>`,
  }),
}
