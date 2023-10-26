import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'

import { getHarness } from '@theseam/ui-common/testing'
import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamToggleButtonComponent } from './toggle-button.component'
import { TheSeamToggleButtonComponentHarness } from '../testing/toggle-button.harness'

interface StoryExtraProps {
  btnText: string
}

const meta: Meta<TheSeamToggleButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/ToggleButton',
  component: TheSeamToggleButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        TheSeamButtonsModule,
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    theme: themeWithOutlineArgType,
    size: sizeArgType,
    type: buttonTypeArgType,
  },
  args: {
    btnText: 'Example Text',
  },
}

export default meta
type Story = StoryObj<TheSeamToggleButtonComponent & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <button seamToggleButton
        [theme]="theme"
        [size]="size"
        [type]="type">
        {{ btnText }}
      </button>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TheSeamToggleButtonComponentHarness, { canvasElement, fixture })
    await expect(await harness.getText()).toBe('Example Text')
    await expect(await harness.getTheme()).toBe(null)
    await expect(await harness.isDisabled()).toBe(false)
    await expect(await harness.hasDisabledAria()).toBe(false)
    await expect(await harness.isActive()).toBe(false)
    await harness.click()
    await expect(await harness.isActive()).toBe(true)
  },
}
