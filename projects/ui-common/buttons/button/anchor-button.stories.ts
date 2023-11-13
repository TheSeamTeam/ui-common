import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { getHarness } from '@theseam/ui-common/testing'
import { ArgsTplOptions, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'
import { TheSeamAnchorButtonComponent, TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { argsToTpl } from '@theseam/ui-common/story-helpers'

import { TheSeamAnchorButtonComponentHarness } from '../testing/anchor-button.harness'

interface StoryExtraProps {
  btnText: string
  click: () => void
}

const meta: Meta<TheSeamAnchorButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/AnchorButton',
  component: TheSeamAnchorButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamButtonsModule,
      ],
    }),
  ],
  render: args => ({
    props: args,
    template: `<a seamButton ${argsToTpl()}>{{ btnText }}</a>`
  }),
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    size: sizeArgType,
    // TODO: Fix click event handling.
    // click: { action: 'click' },
  },
  parameters: {
    argsToTplOptions: {
      exclude: [
        'btnText',
      ],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<TheSeamAnchorButtonComponent & StoryExtraProps>

export const Basic: Story = {
  args: {
    btnText: 'Example Text',
    theme: 'primary'
  },
  play: async ({ canvasElement, fixture, args }) => {
    const harness = await getHarness(TheSeamAnchorButtonComponentHarness, { canvasElement, fixture })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await expect(await harness.getTabIndex()).toBe(0)
    // await harness.click()
    // await expect(args.click).toHaveBeenCalled()
  },
}

export const Disabled: Story = {
  args: {
    btnText: 'Example Text',
    disabled: true,
  },
  play: async ({ canvasElement, fixture, args }) => {
    const harness = await getHarness(TheSeamAnchorButtonComponentHarness, { canvasElement, fixture })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
    await expect(await harness.getTabIndex()).toBe(-1)
    // await harness.click()
    // await expect(args.click).not.toHaveBeenCalled()
  },
}
