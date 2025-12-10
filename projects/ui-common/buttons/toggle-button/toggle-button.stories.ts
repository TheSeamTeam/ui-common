import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { ReactiveFormsModule } from '@angular/forms'

import { getHarness } from '@theseam/ui-common/testing'
import {
  argsToTpl,
  ArgsTplOptions,
  buttonTypeArgType,
  sizeArgType,
  themeWithOutlineArgType,
} from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamToggleButtonComponent } from './toggle-button.component'
import { TheSeamToggleButtonComponentHarness } from '../testing/toggle-button.harness'

interface StoryExtraProps {
  btnText: string
  click: () => void
}

const meta: Meta<TheSeamToggleButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/ToggleButton',
  component: TheSeamToggleButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, TheSeamButtonsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<button seamToggleButton ${argsToTpl()}>{{ btnText }}</button>`,
  }),
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    size: sizeArgType,
    type: buttonTypeArgType,
    click: { action: 'click' },
  },
  args: {
    btnText: 'Example Text',
    click: fn(),
  },
  parameters: {
    argsToTplOptions: {
      alwaysBind: ['theme', 'size', 'type'],
      exclude: ['btnText'],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<TheSeamToggleButtonComponent & StoryExtraProps>

export const Basic: Story = {
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamToggleButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe(null)
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await expect(await harness.isActive()).toBe(false)
    await harness.click()
    await expect(args.click).toHaveBeenCalled()
    await expect(await harness.isActive()).toBe(true)
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamToggleButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe(null)
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
    await expect(await harness.isActive()).toBe(false)
    await harness.click()
    await expect(args.click).not.toHaveBeenCalled()
    await expect(await harness.isActive()).toBe(false)
  },
}
