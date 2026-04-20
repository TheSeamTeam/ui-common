import { Meta, StoryObj } from '@storybook/angular'
import { expect } from 'storybook/test'

import { storyModalDecorator } from '@theseam/ui-common/story-helpers'
import { getHarness } from '@theseam/ui-common/testing'

import {
  TheSeamSignatureInputPanelComponent,
  TheSeamSignatureInputPanelHarness,
} from '@theseam/ui-common/signature-input'

const meta: Meta<TheSeamSignatureInputPanelComponent> = {
  title: 'Signature Input/Panel',
  tags: ['autodocs'],
  component: TheSeamSignatureInputPanelComponent,
  decorators: [storyModalDecorator()],
  parameters: {
    docs: {
      story: { height: '500px' },
    },
  },
}

export default meta
type Story = StoryObj<TheSeamSignatureInputPanelComponent>

/**
 * The panel rendered inside a stand-in modal frame — the way it's used in
 * production. Use the pen/type/upload tabs to try each input; submit and
 * cancel fire the `result` output, which the Actions addon captures.
 */
export const InModal: Story = {}

/**
 * Verifies initial render: the panel mounts with submit disabled on the
 * default "pen" tab.
 */
export const InitialState: Story = {
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamSignatureInputPanelHarness, {
      canvasElement,
    })
    await expect(await harness.isSubmitDisabled()).toBe(true)
    await expect(await harness.getActiveType()).toBe('pen')
  },
}

/**
 * Switching tabs exchanges the active input component. The submit button
 * stays disabled until the new tab's control holds a non-empty value.
 */
export const SwitchTabs: Story = {
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamSignatureInputPanelHarness, {
      canvasElement,
    })
    await harness.showType('text')
    await expect(await harness.getActiveType()).toBe('text')

    await harness.showType('img')
    await expect(await harness.getActiveType()).toBe('img')

    await harness.showType('pen')
    await expect(await harness.getActiveType()).toBe('pen')
  },
}
