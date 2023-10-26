import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { getHarness } from '@theseam/ui-common/testing'
import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamBadgeButtonComponent } from './badge-button.component'
import { TheSeamBadgeButtonComponentHarness } from '../testing/badge-button.harness'

interface StoryExtraProps {
  btnText: string
}

const meta: Meta<TheSeamBadgeButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/BadgeButton',
  component: TheSeamBadgeButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamButtonsModule,
      ],
    }),
    componentWrapperDecorator(story => `
      <button seamBadgeButton
        [theme]="theme"
        [badgeTheme]="badgeTheme"
        [badgeText]="badgeText"
        [size]="size"
        [disabled]="disabled"
        [type]="type"
      >${story}</button>
    `),
  ],
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    badgeText: {
      defaultValue: 'Badge Text',
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    badgeTheme: themeWithOutlineArgType,
    size: sizeArgType,
    type: buttonTypeArgType,
  },
}

export default meta
type Story = StoryObj<TheSeamBadgeButtonComponent & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`,
  }),
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    badgeText: 'Badge Text',
    badgeTheme: 'primary',
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamBadgeButtonComponentHarness, { canvasElement, fixture })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
  },
}

export const Disabled: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`,
  }),
  args: {
    btnText: 'Example Text',
    theme: 'primary',
    badgeText: 'Badge Text',
    badgeTheme: 'primary',
    disabled: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamBadgeButtonComponentHarness, { canvasElement, fixture })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe('primary')
    await expect(await harness.getBadgeText()).toBe('Badge Text')
    await expect(await harness.getBadgeTheme()).toBe('primary')
    await expect(await harness.isDisabled()).toBe(true)
    await expect(await harness.hasDisabledAria()).toBe(true)
  },
}
