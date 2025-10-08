import { Injectable } from '@angular/core'

import { AlterationDisplayItem, AlterationDiffState } from '../models/alteration-display.model'

@Injectable({
  providedIn: 'root',
})
export class AlterationDisplayService {

  /**
   * Calculate the differences between current and pending alterations
   */
  calculateDiff(
    current: AlterationDisplayItem[],
    pending: AlterationDisplayItem[],
  ): AlterationDiffState {
    const currentIds = new Set(current.map(item => item.id))
    const pendingIds = new Set(pending.map(item => item.id))

    const added = pending.filter(item => !currentIds.has(item.id))
    const removed = current.filter(item => !pendingIds.has(item.id))

    const unchanged: AlterationDisplayItem[] = []
    const changed: AlterationDisplayItem[] = []

    // Check for changes in items that exist in both arrays
    for (const currentItem of current) {
      if (pendingIds.has(currentItem.id)) {
        const pendingItem = pending.find(item => item.id === currentItem.id)!

        if (this._areItemsEqual(currentItem, pendingItem)) {
          unchanged.push(currentItem)
        } else {
          changed.push(pendingItem) // Use the pending version for changed items
        }
      }
    }

    return {
      added,
      removed,
      changed,
      unchanged,
    }
  }

  /**
   * Group and sort alteration items by type and sort order
   */
  groupAndSortItems(items: AlterationDisplayItem[]): AlterationDisplayItem[] {
    // Define type order: sort, order, hide-column, width, filter (filters last due to variation)
    const typeOrder: Record<string, number> = {
      'sort': 1,
      'order': 2,
      'hide-column': 3,
      'width': 4,
      'filter': 5,
    }

    return items.sort((a, b) => {
      // First sort by type
      const typeOrderA = typeOrder[a.type] || 999
      const typeOrderB = typeOrder[b.type] || 999

      if (typeOrderA !== typeOrderB) {
        return typeOrderA - typeOrderB
      }

      // Then sort by sortOrder within the same type
      const sortOrderA = a.sortOrder || 0
      const sortOrderB = b.sortOrder || 0

      if (sortOrderA !== sortOrderB) {
        return sortOrderA - sortOrderB
      }

      // Finally sort by id for consistent ordering
      return a.id.localeCompare(b.id)
    })
  }

  /**
   * Get a user-friendly type display name
   */
  getTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
      'sort': 'Sort',
      'order': 'Order',
      'hide-column': 'Visibility',
      'width': 'Width',
      'filter': 'Filter',
    }
    return typeNames[type] || type
  }

  /**
   * Get an icon name for the alteration type (FontAwesome icon names)
   */
  getTypeIconName(type: string): string {
    const typeIcons: Record<string, string> = {
      'sort': 'sort',
      'order': 'arrows-alt',
      'hide-column': 'eye-slash',
      'width': 'arrows-alt-h',
      'filter': 'filter',
    }
    return typeIcons[type] || 'cog'
  }

  private _areItemsEqual(item1: AlterationDisplayItem, item2: AlterationDisplayItem): boolean {
    // Compare all properties except sortOrder (which shouldn't affect equality)
    return (
      item1.id === item2.id &&
      item1.type === item2.type &&
      item1.summary === item2.summary &&
      this._areArraysEqual(item1.details || [], item2.details || [])
    )
  }

  private _areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false
    }

    return arr1.every((item, index) => item === arr2[index])
  }
}
