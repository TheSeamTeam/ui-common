import { Meta, StoryObj } from '@storybook/angular'

import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamAlphabetListFilterComponent, FILTER_ALPHABET } from './alphabet-list-filter.component'
import { TheSeamAlphabetListFilterHarness } from './testing/alphabet-list-filter.harness'

const meta: Meta = {
  title: 'AlphabetListFilter/Components',
  component: TheSeamAlphabetListFilterComponent,
  argTypes: {
    filterValue: { theme: { control: 'select', options: [ undefined, FILTER_ALPHABET ] } },
  }
}

export default meta
type Story = StoryObj<TheSeamAlphabetListFilterComponent>

export const Basic: Story = {
  play: async ({ canvasElement, fixture }) => {
    const vlfHarness = await getHarness(TheSeamAlphabetListFilterHarness, { canvasElement, fixture })
    await expectFn(await vlfHarness.hasClearOption()).toBe(true)
    await expectFn(await vlfHarness.filterValue()).toBe(undefined)
  }
}

export const SelectValue: Story = {
  play: async ({ canvasElement, fixture }) => {
    const vlfHarness = await getHarness(TheSeamAlphabetListFilterHarness, { canvasElement, fixture })
    await expectFn(await vlfHarness.filterValue()).toBe(undefined)
    await vlfHarness.clickValue('A')
    await expectFn(await vlfHarness.filterValue()).toBe('A')
  }
}

export const UnselectValue: Story = {
  args: {
    filterValue: 'A'
  },
  play: async ({ canvasElement, fixture }) => {
    const vlfHarness = await getHarness(TheSeamAlphabetListFilterHarness, { canvasElement, fixture })
    await expectFn(await vlfHarness.filterValue()).toBe('A')
    await vlfHarness.clickValue('A')
    await expectFn(await vlfHarness.filterValue()).toBe(undefined)
    await vlfHarness.clickValue('A')
    await expectFn(await vlfHarness.filterValue()).toBe('A')
    await vlfHarness.clearFilter()
    await expectFn(await vlfHarness.filterValue()).toBe(undefined)
  }
}

export const WithoutClearOption: Story = {
  args: {
    showClearOption: false,
  },
  play: async ({ canvasElement, fixture }) => {
    const vlfHarness = await getHarness(TheSeamAlphabetListFilterHarness, { canvasElement, fixture })
    await expectFn(await vlfHarness.hasClearOption()).toBe(false)
  }
}
