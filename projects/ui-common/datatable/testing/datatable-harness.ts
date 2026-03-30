import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import { TheSeamDatatableColumnPreferencesButtonHarness } from './datatable-column-preferences-button-harness'
import {
  TheSeamDatatableHeaderCellHarness,
  TheSeamDatatableHeaderCellHarnessFilters,
} from './datatable-header-cell-harness'
import { TheSeamDatatableMenuBarHarness } from './datatable-menu-bar-harness'
import { TheSeamDatatablePagerHarness } from './datatable-pager-harness'
import {
  TheSeamDatatableRowHarness,
  TheSeamDatatableRowHarnessFilters,
} from './datatable-row-harness'

export type TheSeamDatatableHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable'

  static with<T extends TheSeamDatatableHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private readonly _pager = this.locatorForOptional(
    TheSeamDatatablePagerHarness,
  )

  // -- Pager --

  public async getCurrentPage(): Promise<number> {
    const pager = await this._pager()
    if (!pager) {
      throw Error('Pager not found on this datatable.')
    }
    return pager.getCurrentPageNumber()
  }

  public async getPager(): Promise<TheSeamDatatablePagerHarness | null> {
    return this._pager()
  }

  // -- Rows --

  /** Gets all visible body rows, optionally filtered. */
  public async getRows(
    filters?: TheSeamDatatableRowHarnessFilters,
  ): Promise<TheSeamDatatableRowHarness[]> {
    return this.locatorForAll(
      filters
        ? TheSeamDatatableRowHarness.with(filters)
        : TheSeamDatatableRowHarness,
    )()
  }

  /** Gets a body row by its index. */
  public async getRow(index: number): Promise<TheSeamDatatableRowHarness> {
    const rows = await this.getRows()
    if (index < 0 || index >= rows.length) {
      throw Error(
        `Row index ${index} is out of bounds. Table has ${rows.length} rows.`,
      )
    }
    return rows[index]
  }

  /** Gets the number of visible body rows. */
  public async getRowCount(): Promise<number> {
    return (await this.getRows()).length
  }

  // -- Header Cells --

  /** Gets all header cells, optionally filtered. */
  public async getHeaderCells(
    filters?: TheSeamDatatableHeaderCellHarnessFilters,
  ): Promise<TheSeamDatatableHeaderCellHarness[]> {
    return this.locatorForAll(
      filters
        ? TheSeamDatatableHeaderCellHarness.with(filters)
        : TheSeamDatatableHeaderCellHarness,
    )()
  }

  /** Gets a header cell by column name. */
  public async getHeaderCell(
    name: string | RegExp,
  ): Promise<TheSeamDatatableHeaderCellHarness> {
    const cells = await this.getHeaderCells({ name })
    if (cells.length === 0) {
      throw Error(`Header cell with name matching "${name}" not found.`)
    }
    return cells[0]
  }

  /** Gets the number of visible columns. */
  public async getColumnCount(): Promise<number> {
    return (await this.getHeaderCells()).length
  }

  // -- Selection --

  /** Gets all currently selected rows. */
  public async getSelectedRows(): Promise<TheSeamDatatableRowHarness[]> {
    return this.getRows({ selected: true })
  }

  // -- Menu Bar & Preferences --

  /** Gets the menu bar harness, or `null` if no menu bar is present. */
  public async getMenuBar(): Promise<TheSeamDatatableMenuBarHarness | null> {
    return this.locatorForOptional(TheSeamDatatableMenuBarHarness)()
  }

  /** Gets the column preferences button harness, or `null` if not present. */
  public async getColumnPreferencesButton(): Promise<TheSeamDatatableColumnPreferencesButtonHarness | null> {
    return this.locatorForOptional(
      TheSeamDatatableColumnPreferencesButtonHarness,
    )()
  }

  // -- Convenience --

  /** Gets the text content of a cell by row and column index. */
  public async getCellText(
    rowIndex: number,
    colIndex: number,
  ): Promise<string> {
    const row = await this.getRow(rowIndex)
    return row.getCellText(colIndex)
  }

  /** Whether the table is showing its empty message (no rows). */
  public async isEmpty(): Promise<boolean> {
    const emptyRow = await this.locatorForOptional('.empty-row')()
    return emptyRow !== null
  }
}
