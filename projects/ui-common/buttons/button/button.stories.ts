import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { getHarness } from '@theseam/ui-common/testing'
import {
  argsToTpl,
  ArgsTplOptions,
  buttonTypeArgType,
  sizeArgType,
  themeWithOutlineArgType,
} from '@theseam/ui-common/story-helpers'
import {
  TheSeamButtonComponent,
  TheSeamButtonsModule,
} from '@theseam/ui-common/buttons'

import { TheSeamButtonComponentHarness } from '../testing/button.harness'

interface StoryExtraProps {
  btnText: string
  click: () => void
}

const meta: Meta<TheSeamButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/Button',
  component: TheSeamButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [TheSeamButtonsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<button seamButton ${argsToTpl()}>{{ btnText }}</button>`,
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
  parameters: {
    argsToTplOptions: {
      alwaysBind: ['theme', 'size', 'type'],
      exclude: ['btnText'],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<TheSeamButtonComponent & StoryExtraProps>

export const Basic: Story = {
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    click: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await harness.click()
    await expect(args.click).toHaveBeenCalled()
  },
}

export const Disabled: Story = {
  args: {
    btnText: 'Example Text',
    disabled: true,
    click: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
    await harness.click()
    await expect(args.click).not.toHaveBeenCalled()
  },
}
