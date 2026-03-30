import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import { TheSeamDatatableActionMenuHarness } from './datatable-action-menu-harness'
import {
  TheSeamDatatableCellHarness,
  TheSeamDatatableCellHarnessFilters,
} from './datatable-cell-harness'

export interface TheSeamDatatableRowHarnessFilters extends BaseHarnessFilters {
  /** Filters based on whether the row is selected. */
  selected?: boolean
}

export class TheSeamDatatableRowHarness extends ComponentHarness {
  static hostSelector = '.datatable-body-row'

  static with<T extends TheSeamDatatableRowHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableRowHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'selected',
      options.selected,
      async (harness, selected) => (await harness.isSelected()) === selected,
    )
  }

  /** Gets all cells in this row, optionally filtered. */
  public async getCells(
    filters?: TheSeamDatatableCellHarnessFilters,
  ): Promise<TheSeamDatatableCellHarness[]> {
    return this.locatorForAll(
      filters
        ? TheSeamDatatableCellHarness.with(filters)
        : TheSeamDatatableCellHarness,
    )()
  }

  /** Gets a cell by its index in the row. */
  public async getCell(index: number): Promise<TheSeamDatatableCellHarness> {
    const cells = await this.getCells()
    if (index < 0 || index >= cells.length) {
      throw Error(
        `Cell index ${index} is out of bounds. Row has ${cells.length} cells.`,
      )
    }
    return cells[index]
  }

  /** Convenience method to get the text content of a cell by index. */
  public async getCellText(index: number): Promise<string> {
    return (await this.getCell(index)).getText()
  }

  /** Whether this row is selected. */
  public async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('active')
  }

  /** Clicks the row to activate it. */
  public async click(): Promise<void> {
    return (await this.host()).click()
  }

  /** Gets the action menu harness for this row, or `null` if no action menu exists. */
  public async getActionMenu(): Promise<TheSeamDatatableActionMenuHarness | null> {
    return this.locatorForOptional(TheSeamDatatableActionMenuHarness)()
  }

  // -- Row Detail --

  /** Whether this row's detail section is expanded. */
  public async isExpanded(): Promise<boolean> {
    const detail = await this.locatorForOptional('.datatable-row-detail')()
    return detail !== null
  }

  /** Gets the row detail content element, or `null` if not expanded. */
  public async getDetailContent() {
    return this.locatorForOptional('.datatable-row-detail')()
  }

  // -- Selection --

  /** Whether this row has a selection checkbox. */
  public async hasCheckbox(): Promise<boolean> {
    const checkbox = await this.locatorForOptional(
      '.datatable-checkbox input[type="checkbox"]',
    )()
    return checkbox !== null
  }

  /** Clicks the selection checkbox on this row. */
  public async clickCheckbox(): Promise<void> {
    const checkbox = await this.locatorForOptional(
      '.datatable-checkbox input[type="checkbox"]',
    )()
    if (!checkbox) {
      throw Error('This row does not have a selection checkbox.')
    }
    return checkbox.click()
  }
}
