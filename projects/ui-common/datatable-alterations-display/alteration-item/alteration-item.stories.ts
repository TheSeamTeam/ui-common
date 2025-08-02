import { Meta, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'
import { getHarness } from '@theseam/ui-common/testing'

import { AlterationItemComponent } from './alteration-item.component'
import { AlterationDisplayItem } from '../models/alteration-display.model'
import { AlterationItemHarness } from '../testing/alteration-item.harness'

const meta: Meta<AlterationItemComponent> = {
  title: 'DataTable/Alterations Display/Alteration Item',
  component: AlterationItemComponent,
  tags: ['autodocs'],
  argTypes: {
    diffState: {
      control: { type: 'select' },
      options: ['added', 'removed', 'changed', 'unchanged', undefined]
    },
    compact: {
      control: { type: 'boolean' }
    }
  }
}

export default meta
type Story = StoryObj<AlterationItemComponent>

// Sample data for stories
const sortAlteration: AlterationDisplayItem = {
  id: 'sort',
  type: 'sort',
  summary: 'Name ↑, Date ↓',
  details: ['Name: Ascending (Priority: 1)', 'Date: Descending (Priority: 2)'],
  sortOrder: 0
}

const filterAlteration: AlterationDisplayItem = {
  id: 'filter--status',
  type: 'filter',
  summary: 'Status = Active',
  details: ['Column: Status', 'Type: text', 'Operation: Equals', 'Value: Active'],
  sortOrder: 0
}

const hideColumnAlteration: AlterationDisplayItem = {
  id: 'hide-column--description',
  type: 'hide-column',
  summary: 'Hidden: Description',
  details: ['Column: Description', 'Status: hidden'],
  sortOrder: 68 // 'D'.charCodeAt(0)
}

const widthAlteration: AlterationDisplayItem = {
  id: 'width--name',
  type: 'width',
  summary: 'Name: 200px',
  details: ['Column: Name', 'Width: 200px', 'Auto-resize: disabled'],
  sortOrder: 78 // 'N'.charCodeAt(0)
}

const orderAlteration: AlterationDisplayItem = {
  id: 'order',
  type: 'order',
  summary: '3 columns reordered',
  details: ['Name: Position 1', 'Status: Position 2', 'Date: Position 3'],
  sortOrder: 0
}

export const SortAlteration: Story = {
  args: {
    item: sortAlteration,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.getType()).toBe('sort')
    expect(await harness.getTypeDisplayName()).toBe('Sort')
    expect(await harness.getBadgeClass()).toBe('badge-primary')
    expect(await harness.getSummary()).toBe('Name ↑, Date ↓')
  }
}

export const FilterAlteration: Story = {
  args: {
    item: filterAlteration,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.getType()).toBe('filter')
    expect(await harness.getTypeDisplayName()).toBe('Filter')
    expect(await harness.getBadgeClass()).toBe('badge-warning')
    expect(await harness.getSummary()).toBe('Status = Active')
  }
}

export const HideColumnAlteration: Story = {
  args: {
    item: hideColumnAlteration,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.getType()).toBe('hide-column')
    expect(await harness.getTypeDisplayName()).toBe('Visibility')
    expect(await harness.getBadgeClass()).toBe('badge-secondary')
  }
}

export const WidthAlteration: Story = {
  args: {
    item: widthAlteration,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.getType()).toBe('width')
    expect(await harness.getTypeDisplayName()).toBe('Width')
    expect(await harness.getBadgeClass()).toBe('badge-dark')
  }
}

export const OrderAlteration: Story = {
  args: {
    item: orderAlteration,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.getType()).toBe('order')
    expect(await harness.getTypeDisplayName()).toBe('Order')
    expect(await harness.getBadgeClass()).toBe('badge-info')
  }
}

export const AddedState: Story = {
  args: {
    item: filterAlteration,
    diffState: 'added',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.hasBorderSuccess()).toBe(true)
    expect(await harness.getDiffState()).toBe('added')
  }
}

export const RemovedState: Story = {
  args: {
    item: sortAlteration,
    diffState: 'removed',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.hasBorderDanger()).toBe(true)
    expect(await harness.getDiffState()).toBe('removed')
  }
}

export const ChangedState: Story = {
  args: {
    item: widthAlteration,
    diffState: 'changed',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.hasBorderWarning()).toBe(true)
    expect(await harness.getDiffState()).toBe('changed')
  }
}

export const ExpandedDetails: Story = {
  args: {
    item: sortAlteration,
    compact: false
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationItemHarness, { canvasElement, fixture })

    expect(await harness.hasDetails()).toBe(true)
    const details = await harness.getDetails()
    expect(details.length).toBeGreaterThan(0)
    expect(details[0]).toContain('Name: Ascending')
  }
}
