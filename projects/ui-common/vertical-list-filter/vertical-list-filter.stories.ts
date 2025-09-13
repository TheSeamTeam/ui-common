import { Meta, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/test'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamVerticalListFilterComponent, FILTER_VALUES } from './vertical-list-filter.component'
import { TheSeamVerticalListFilterHarness } from './testing/vertical-list-filter.harness'

interface ExtraArgs { }

type StoryComponentType = TheSeamVerticalListFilterComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'VerticalListFilter/Components',
  component: TheSeamVerticalListFilterComponent,
  argTypes: {
    filterValue: { theme: { control: 'select', options: [ undefined, FILTER_VALUES ] } },
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expect(await alfHarness.hasClearOption()).toBe(true)
    await expect(await alfHarness.filterValue()).toBe(undefined)
  },
}

export const SelectValue: Story = {
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expect(await alfHarness.filterValue()).toBe(undefined)
    await alfHarness.clickValue('A')
    await expect(await alfHarness.filterValue()).toBe('A')
  },
}

export const UnselectValue: Story = {
  args: {
    filterValue: 'A',
  },
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expect(await alfHarness.filterValue()).toBe('A')
    await alfHarness.clickValue('A')
    await expect(await alfHarness.filterValue()).toBe(undefined)
    await alfHarness.clickValue('A')
    await expect(await alfHarness.filterValue()).toBe('A')
    await alfHarness.clearFilter()
    await expect(await alfHarness.filterValue()).toBe(undefined)
  },
}

export const WithoutClearOption: Story = {
  args: {
    showClearOption: false,
  },
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expect(await alfHarness.hasClearOption()).toBe(false)
  },
}
