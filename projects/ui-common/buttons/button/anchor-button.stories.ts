import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { expectFn, getHarness } from '@theseam/ui-common/testing'
import { sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamAnchorButtonComponent, TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamAnchorButtonComponentHarness } from '../testing/anchor-button.harness'

interface StoryExtraProps {
  btnText: string
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
    componentWrapperDecorator(story => `
      <a seamButton
        [theme]="theme"
        [size]="size"
        [tabIndex]="tabIndex"
        [disabled]="disabled"
      >${story}</a>
    `),
  ],
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    size: sizeArgType,
  },
}

export default meta
type Story = StoryObj<TheSeamAnchorButtonComponent & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`,
  }),
  args: {
    btnText: 'Example Text',
    theme: 'primary'
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamAnchorButtonComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getText()).toBe('Example Text')
    await expectFn(await harness.getTheme()).toBe('primary')
    await expectFn(await harness.isDisabled()).toBe(false)
    await expectFn(await harness.hasDisabledAria()).toBe(false)
    await expectFn(await harness.getTabIndex()).toBe(0)
  },
}

export const Disabled: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`,
  }),
  args: {
    btnText: 'Example Text',
    disabled: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamAnchorButtonComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getText()).toBe('Example Text')
    await expectFn(await harness.isDisabled()).toBe(true)
    await expectFn(await harness.hasDisabledAria()).toBe(true)
    await expectFn(await harness.getTabIndex()).toBe(-1)
  },
}
