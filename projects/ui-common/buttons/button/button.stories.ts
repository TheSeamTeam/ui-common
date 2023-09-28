import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { expectFn, getHarness } from '@theseam/ui-common/testing'
import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonComponent, TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamButtonComponentHarness } from '../testing/button.harness'

interface StoryExtraProps {
  btnText: string
}

const meta: Meta<TheSeamButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/Button',
  component: TheSeamButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamButtonsModule,
      ],
    }),
    componentWrapperDecorator(story => `
      <button seamButton
        [theme]="theme"
        [size]="size"
        [type]="type"
        [disabled]="disabled"
      >${story}</button>
    `),
  ],
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    size: sizeArgType,
    type: buttonTypeArgType
  },
}

export default meta
type Story = StoryObj<TheSeamButtonComponent & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`
  }),
  args: {
    btnText: 'Example Text',
    theme: 'primary'
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamButtonComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getText()).toBe('Example Text')
    await expectFn(await harness.getTheme()).toBe('primary')
    await expectFn(await harness.isDisabled()).toBe(false)
    await expectFn(await harness.hasDisabledAria()).toBe(false)
  },
}

export const Disabled: Story = {
  render: args => ({
    props: args,
    template: `{{ btnText }}`
  }),
  args: {
    btnText: 'Example Text',
    disabled: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamButtonComponentHarness, { canvasElement, fixture })
    await expectFn(await harness.getText()).toBe('Example Text')
    await expectFn(await harness.isDisabled()).toBe(true)
    await expectFn(await harness.hasDisabledAria()).toBe(true)
  },
}
