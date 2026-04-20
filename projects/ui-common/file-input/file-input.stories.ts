import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { argsToTpl } from '@theseam/ui-common/story-helpers'

import { TheSeamFileInputComponent } from './file-input.component'

const meta: Meta<TheSeamFileInputComponent> = {
  title: 'File Input/Components/File Input',
  component: TheSeamFileInputComponent,
  decorators: [moduleMetadata({ imports: [TheSeamFileInputComponent] })],
  render: (args) => ({
    props: { ...args, filesAdded: fn(), rejected: fn() },
    template: `<seam-file-input ${argsToTpl()} (filesAdded)="filesAdded($event)" (rejected)="rejected($event)"></seam-file-input>`,
  }),
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileInputComponent>

export const Default: Story = { args: {} }

export const Multiple: Story = { args: { multiple: true } }

export const WithAcceptFilter: Story = { args: { accept: 'image/*' } }

export const WithMaxSize: Story = { args: { maxSize: 1024 * 1024 } }

export const WithMaxFiles: Story = { args: { multiple: true, maxFiles: 3 } }

export const Disabled: Story = { args: { disabled: true } }

export const HiddenErrors: Story = {
  args: { accept: 'image/*', hideErrors: true },
}

export const CustomPrompt: Story = {
  args: {
    promptText: 'Choose an image',
    promptSuffix: 'or drop it here',
    accept: 'image/*',
  },
}
