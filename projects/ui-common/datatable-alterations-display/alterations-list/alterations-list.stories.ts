import { Meta, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'
import { getHarness } from '@theseam/ui-common/testing'

import { AlterationsListComponent } from './alterations-list.component'
import { AlterationDisplayItem } from '../models/alteration-display.model'
import { AlterationsListHarness } from '../testing/alterations-list.harness'

const meta: Meta<AlterationsListComponent> = {
  title: 'DataTable/Alterations Display/Alterations List',
  component: AlterationsListComponent,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: { type: 'boolean' }
    },
    groupByType: {
      control: { type: 'boolean' }
    },
    sortWithinType: {
      control: { type: 'boolean' }
    },
    diffState: {
      control: { type: 'select' },
      options: ['current', 'pending', undefined]
    }
  }
}

export default meta
type Story = StoryObj<AlterationsListComponent>

// Sample data for stories
const sampleAlterations: AlterationDisplayItem[] = [
  {
    id: 'sort',
    type: 'sort',
    summary: 'Name ↑, Date ↓',
    details: ['Name: Ascending (Priority: 1)', 'Date: Descending (Priority: 2)'],
    sortOrder: 0
  },
  {
    id: 'filter--status',
    type: 'filter',
    summary: 'Status = Active',
    details: ['Column: Status', 'Type: text', 'Operation: Equals', 'Value: Active'],
    sortOrder: 0
  },
  {
    id: 'hide-column--description',
    type: 'hide-column',
    summary: 'Hidden: Description',
    details: ['Column: Description', 'Status: hidden'],
    sortOrder: 68
  },
  {
    id: 'width--name',
    type: 'width',
    summary: 'Name: 200px',
    details: ['Column: Name', 'Width: 200px', 'Auto-resize: disabled'],
    sortOrder: 78
  },
  {
    id: 'order',
    type: 'order',
    summary: '3 columns reordered',
    details: ['Name: Position 1', 'Status: Position 2', 'Date: Position 3'],
    sortOrder: 0
  }
]

const emptyAlterations: AlterationDisplayItem[] = []

export const WithItems: Story = {
  args: {
    items: sampleAlterations,
    title: 'Current Alterations',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getTitle()).toBe('Current Alterations')
    expect(await harness.getCount()).toBe('(5)')
    expect(await harness.getItemCount()).toBe(5)
    expect(await harness.hasItems()).toBe(true)
    expect(await harness.hasEmptyState()).toBe(false)

    const itemTypes = await harness.getItemTypes()
    expect(itemTypes).toContain('sort')
    expect(itemTypes).toContain('filter')
    expect(itemTypes).toContain('hide-column')
    expect(itemTypes).toContain('width')
    expect(itemTypes).toContain('order')
  }
}

export const EmptyList: Story = {
  args: {
    items: emptyAlterations,
    title: 'Pending Alterations',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getTitle()).toBe('Pending Alterations')
    expect(await harness.getItemCount()).toBe(0)
    expect(await harness.hasItems()).toBe(false)
    expect(await harness.hasEmptyState()).toBe(true)
  }
}

export const WithoutTitle: Story = {
  args: {
    items: sampleAlterations,
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getTitle()).toBeNull()
    expect(await harness.getItemCount()).toBe(5)
  }
}

export const ExpandedView: Story = {
  args: {
    items: sampleAlterations,
    title: 'Detailed Alterations',
    compact: false
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getItemCount()).toBe(5)

    // Check that details are visible in expanded view
    const detailsElements = canvasElement.querySelectorAll('[data-testid="alteration-detail"]')
    expect(detailsElements.length).toBeGreaterThan(0)
  }
}

export const SingleItem: Story = {
  args: {
    items: [sampleAlterations[0]],
    title: 'Single Alteration',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getTitle()).toBe('Single Alteration')
    expect(await harness.getItemCount()).toBe(1)

    const sortItem = await harness.getItemByType('sort')
    expect(sortItem).toBeTruthy()
  }
}

export const WithDiffStates: Story = {
  args: {
    items: sampleAlterations.map((item, index) => ({
      ...item,
      diffState: ['added', 'removed', 'changed', 'unchanged', 'added'][index] as any
    })),
    title: 'Alterations with Diff States',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsListHarness, { canvasElement, fixture })

    expect(await harness.getItemCount()).toBe(5)

    // Check that different border colors are applied
    const addedBorders = canvasElement.querySelectorAll('.border-success')
    const removedBorders = canvasElement.querySelectorAll('.border-danger')
    const changedBorders = canvasElement.querySelectorAll('.border-warning')

    expect(addedBorders.length).toBeGreaterThan(0)
    expect(removedBorders.length).toBeGreaterThan(0)
    expect(changedBorders.length).toBeGreaterThan(0)
  }
}
