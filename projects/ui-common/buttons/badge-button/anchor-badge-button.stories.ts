import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { getHarness } from '@theseam/ui-common/testing'
import {
  argsToTpl,
  ArgsTplOptions,
  sizeArgType,
  themeWithOutlineArgType,
} from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamAnchorBadgeButtonComponent } from './badge-button.component'
import { TheSeamAnchorBadgeButtonComponentHarness } from '../testing/anchor-badge-button.harness'

interface StoryExtraProps {
  btnText: string
  click: () => void
}

const meta: Meta<TheSeamAnchorBadgeButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/AnchorBadgeButton',
  component: TheSeamAnchorBadgeButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [TheSeamButtonsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<a seamBadgeButton ${argsToTpl()}>{{ btnText }}</a>`,
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
type Story = StoryObj<TheSeamAnchorBadgeButtonComponent & StoryExtraProps>

export const Basic: Story = {
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    badgeText: 'Badge Text',
    badgeTheme: 'primary',
    click: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const harness = await getHarness(TheSeamAnchorBadgeButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await expect(await harness.getTabIndex()).toBe(0)
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
    const harness = await getHarness(TheSeamAnchorBadgeButtonComponentHarness, {
      canvasElement,
    })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
    await expect(await harness.getTabIndex()).toBe(-1)
    await harness.click()
    await expect(args.click).not.toHaveBeenCalled()
  },
}
