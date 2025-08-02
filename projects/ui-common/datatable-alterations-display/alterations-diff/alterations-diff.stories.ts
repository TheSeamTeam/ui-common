import { Meta, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'
import { getHarness } from '@theseam/ui-common/testing'

import { AlterationsDiffComponent } from './alterations-diff.component'
import { AlterationDisplayItem } from '../models/alteration-display.model'
import { AlterationsDiffHarness } from '../testing/alterations-diff.harness'

const meta: Meta<AlterationsDiffComponent> = {
  title: 'DataTable/Alterations Display/Alterations Diff',
  component: AlterationsDiffComponent,
  tags: ['autodocs'],
  argTypes: {
    diffMode: {
      control: { type: 'select' },
      options: ['auto', 'manual']
    },
    compact: {
      control: { type: 'boolean' }
    }
  }
}

export default meta
type Story = StoryObj<AlterationsDiffComponent>

// Sample data for stories
const currentAlterations: AlterationDisplayItem[] = [
  {
    id: 'sort',
    type: 'sort',
    summary: 'Name ↑',
    details: ['Name: Ascending'],
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
    id: 'width--name',
    type: 'width',
    summary: 'Name: 150px',
    details: ['Column: Name', 'Width: 150px', 'Auto-resize: disabled'],
    sortOrder: 78
  }
]

const pendingAlterations: AlterationDisplayItem[] = [
  {
    id: 'sort',
    type: 'sort',
    summary: 'Name ↑, Date ↓',
    details: ['Name: Ascending (Priority: 1)', 'Date: Descending (Priority: 2)'],
    sortOrder: 0
  },
  {
    id: 'filter--category',
    type: 'filter',
    summary: 'Category contains "Product"',
    details: ['Column: Category', 'Type: text', 'Operation: Contains', 'Value: Product'],
    sortOrder: 0
  },
  {
    id: 'width--name',
    type: 'width',
    summary: 'Name: 200px',
    details: ['Column: Name', 'Width: 200px', 'Auto-resize: disabled'],
    sortOrder: 78
  },
  {
    id: 'hide-column--description',
    type: 'hide-column',
    summary: 'Hidden: Description',
    details: ['Column: Description', 'Status: hidden'],
    sortOrder: 68
  }
]

const emptyAlterations: AlterationDisplayItem[] = []

export const WithDifferences: Story = {
  args: {
    currentItems: currentAlterations,
    pendingItems: pendingAlterations,
    diffMode: 'auto',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    expect(await harness.hasDiffSummary()).toBe(true)
    const summaryText = await harness.getDiffSummaryText()
    expect(summaryText).toContain('added')
    expect(summaryText).toContain('removed')
    expect(summaryText).toContain('changed')

    expect(await harness.getCurrentItemCount()).toBe(3)
    expect(await harness.getPendingItemCount()).toBe(4)
  }
}

export const NoDifferences: Story = {
  args: {
    currentItems: currentAlterations,
    pendingItems: currentAlterations, // Same items
    diffMode: 'auto',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    expect(await harness.hasDiffSummary()).toBe(false)
    expect(await harness.getCurrentItemCount()).toBe(3)
    expect(await harness.getPendingItemCount()).toBe(3)
  }
}

export const EmptyCurrentState: Story = {
  args: {
    currentItems: emptyAlterations,
    pendingItems: pendingAlterations,
    diffMode: 'auto',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    expect(await harness.hasDiffSummary()).toBe(true)
    const summaryText = await harness.getDiffSummaryText()
    expect(summaryText).toContain('added')

    expect(await harness.hasCurrentEmptyState()).toBe(true)
    expect(await harness.getCurrentItemCount()).toBe(0)
    expect(await harness.getPendingItemCount()).toBe(4)
  }
}

export const EmptyPendingState: Story = {
  args: {
    currentItems: currentAlterations,
    pendingItems: emptyAlterations,
    diffMode: 'auto',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    expect(await harness.hasDiffSummary()).toBe(true)
    const summaryText = await harness.getDiffSummaryText()
    expect(summaryText).toContain('removed')

    expect(await harness.hasPendingEmptyState()).toBe(true)
    expect(await harness.getCurrentItemCount()).toBe(3)
    expect(await harness.getPendingItemCount()).toBe(0)
  }
}

export const BothEmpty: Story = {
  args: {
    currentItems: emptyAlterations,
    pendingItems: emptyAlterations,
    diffMode: 'auto',
    compact: true
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    expect(await harness.hasDiffSummary()).toBe(false)
    expect(await harness.hasCurrentEmptyState()).toBe(true)
    expect(await harness.hasPendingEmptyState()).toBe(true)
    expect(await harness.getCurrentItemCount()).toBe(0)
    expect(await harness.getPendingItemCount()).toBe(0)
  }
}

export const ExpandedView: Story = {
  args: {
    currentItems: currentAlterations,
    pendingItems: pendingAlterations,
    diffMode: 'auto',
    compact: false
  },
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(AlterationsDiffHarness, { canvasElement, fixture })

    // Verify that both lists have items
    expect(await harness.getCurrentItemCount()).toBeGreaterThan(0)
    expect(await harness.getPendingItemCount()).toBeGreaterThan(0)

    // Check that details are visible in expanded view
    const detailsElements = canvasElement.querySelectorAll('[data-testid="alteration-detail"]')
    expect(detailsElements.length).toBeGreaterThan(0)
  }
}
