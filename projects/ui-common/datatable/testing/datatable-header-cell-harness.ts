import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import { TheSeamDatatableColumnFilterMenuHarness } from './datatable-column-filter-menu-harness'

export type SortDirection = 'asc' | 'desc' | 'none'

export interface TheSeamDatatableHeaderCellHarnessFilters
  extends BaseHarnessFilters {
  /** Filters based on the column name text. */
  name?: string | RegExp
  /** Filters based on the sort direction. */
  sortDirection?: SortDirection
}

export class TheSeamDatatableHeaderCellHarness extends ComponentHarness {
  static hostSelector = '.datatable-header-cell'

  static with<T extends TheSeamDatatableHeaderCellHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableHeaderCellHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('name', options.name, (harness, name) =>
        HarnessPredicate.stringMatches(harness.getName(), name),
      )
      .addOption(
        'sortDirection',
        options.sortDirection,
        async (harness, dir) => (await harness.getSortDirection()) === dir,
      )
  }

  /** Gets the column name text. */
  public async getName(): Promise<string> {
    const sortBtn = await this.locatorForOptional('.datatable-sort-target')()
    if (sortBtn) {
      return sortBtn.text()
    }
    // Fallback: get text from the header cell itself
    return (await this.host()).text()
  }

  /** Gets the current sort direction of this column. */
  public async getSortDirection(): Promise<SortDirection> {
    const host = await this.host()
    if (await host.hasClass('sort-asc')) {
      return 'asc'
    }
    if (await host.hasClass('sort-desc')) {
      return 'desc'
    }
    return 'none'
  }

  /** Whether this column is sortable. */
  public async isSortable(): Promise<boolean> {
    return (await this.host()).hasClass('sortable')
  }

  /** Clicks the sort button to cycle the sort direction. */
  public async sort(): Promise<void> {
    const sortBtn = await this.locatorForOptional('.datatable-sort-target')()
    if (sortBtn) {
      return sortBtn.click()
    }
    // Fallback: click the header cell itself
    return (await this.host()).click()
  }

  /** Whether this column has a filter button. */
  public async isFilterable(): Promise<boolean> {
    const filterBtn = await this.locatorForOptional(
      '.datatable-column-header-filter-button',
    )()
    return filterBtn !== null
  }

  /** Whether the column filter is currently active. */
  public async isFilterActive(): Promise<boolean> {
    const filterBtn = await this.locatorForOptional(
      '.datatable-column-header-filter-button',
    )()
    if (!filterBtn) {
      return false
    }
    return filterBtn.hasClass('datatable-column-header-filter-button-active')
  }

  /** Opens the column filter menu by clicking the filter button. */
  public async openFilter(): Promise<void> {
    const filterBtn = await this.locatorForOptional(
      '.datatable-column-header-filter-button',
    )()
    if (!filterBtn) {
      throw Error('This column does not have a filter button.')
    }
    return filterBtn.click()
  }

  /**
   * Opens the filter and returns the filter menu harness.
   * The filter menu renders in a CDK overlay, so this uses the document root locator.
   */
  public async getFilterMenu(): Promise<TheSeamDatatableColumnFilterMenuHarness> {
    await this.openFilter()
    const rootLocator = this.documentRootLocatorFactory()
    const menu = await rootLocator.locatorForOptional(
      TheSeamDatatableColumnFilterMenuHarness,
    )()
    if (!menu) {
      throw Error(
        'Column filter menu not found after opening. It may not have rendered yet.',
      )
    }
    return menu
  }

  /** Whether this header cell is a checkbox column (select-all). */
  public async isCheckboxColumn(): Promise<boolean> {
    const checkbox = await this.locatorForOptional(
      '.datatable-checkbox input[type="checkbox"]',
    )()
    return checkbox !== null
  }

  /** Clicks the select-all checkbox in this header cell. */
  public async clickCheckbox(): Promise<void> {
    const checkbox = await this.locatorForOptional(
      '.datatable-checkbox input[type="checkbox"]',
    )()
    if (!checkbox) {
      throw Error('This header cell does not have a select-all checkbox.')
    }
    return checkbox.click()
  }
}
