import { Meta, StoryObj } from '@storybook/angular'

import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamVerticalListFilterComponent, FILTER_VALUES } from './vertical-list-filter.component'
import { TheSeamVerticalListFilterHarness } from './testing/vertical-list-filter.harness'

const meta: Meta = {
  title: 'VerticalListFilter/Components',
  component: TheSeamVerticalListFilterComponent,
  argTypes: {
    filterValue: { theme: { control: 'select', options: [ undefined, FILTER_VALUES ] } },
  }
}

export default meta
type Story = StoryObj<TheSeamVerticalListFilterComponent>

export const Basic: Story = {
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expectFn(await alfHarness.hasClearOption()).toBe(true)
    await expectFn(await alfHarness.filterValue()).toBe(undefined)
  }
}

export const SelectValue: Story = {
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expectFn(await alfHarness.filterValue()).toBe(undefined)
    await alfHarness.clickValue('A')
    await expectFn(await alfHarness.filterValue()).toBe('A')
  }
}

export const UnselectValue: Story = {
  args: {
    filterValue: 'A'
  },
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expectFn(await alfHarness.filterValue()).toBe('A')
    await alfHarness.clickValue('A')
    await expectFn(await alfHarness.filterValue()).toBe(undefined)
    await alfHarness.clickValue('A')
    await expectFn(await alfHarness.filterValue()).toBe('A')
    await alfHarness.clearFilter()
    await expectFn(await alfHarness.filterValue()).toBe(undefined)
  }
}

export const WithoutClearOption: Story = {
  args: {
    showClearOption: false,
  },
  play: async ({ canvasElement, fixture }) => {
    const alfHarness = await getHarness(TheSeamVerticalListFilterHarness, { canvasElement, fixture })
    await expectFn(await alfHarness.hasClearOption()).toBe(false)
  }
}
