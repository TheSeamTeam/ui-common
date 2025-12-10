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

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamBadgeButtonComponent } from './badge-button.component'
import { TheSeamBadgeButtonComponentHarness } from '../testing/badge-button.harness'

interface StoryExtraProps {
  btnText: string
  click: () => void
}

const meta: Meta<TheSeamBadgeButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/BadgeButton',
  component: TheSeamBadgeButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [TheSeamButtonsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<button seamBadgeButton ${argsToTpl()}>{{ btnText }}</button>`,
  }),
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    badgeText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    badgeTheme: themeWithOutlineArgType,
    size: sizeArgType,
    type: buttonTypeArgType,
    click: { action: 'click' },
  },
  parameters: {
    argsToTplOptions: {
      alwaysBind: ['theme', 'size', 'type', 'badgeTheme', 'badgeText'],
      exclude: ['btnText'],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<TheSeamBadgeButtonComponent & StoryExtraProps>

export const Basic: Story = {
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    badgeText: 'Badge Text',
    badgeTheme: 'primary',
    click: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamBadgeButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await harness.click()
    await expect(args.click).toHaveBeenCalled()
  },
}

export const Disabled: Story = {
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    badgeText: 'Badge Text',
    badgeTheme: 'primary',
    disabled: true,
    click: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamBadgeButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
    await harness.click()
    await expect(args.click).not.toHaveBeenCalled()
  },
}
