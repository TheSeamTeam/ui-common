import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import { TheSeamNgSelectHarness } from '@theseam/ui-common/testing'

export type TheSeamDatatableColumnFilterMenuHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableColumnFilterMenuHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-column-filter-menu'

  static with<T extends TheSeamDatatableColumnFilterMenuHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableColumnFilterMenuHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  /** Gets the filter type by checking which sub-component is rendered. */
  public async getFilterType(): Promise<
    'search-text' | 'search-numeric' | 'search-date' | 'custom'
  > {
    if (
      (await this.locatorForOptional(
        'seam-datatable-column-filter-search-text',
      )()) !== null
    ) {
      return 'search-text'
    }
    if (
      (await this.locatorForOptional(
        'seam-datatable-column-filter-search-numeric',
      )()) !== null
    ) {
      return 'search-numeric'
    }
    if (
      (await this.locatorForOptional(
        'seam-datatable-column-filter-search-date',
      )()) !== null
    ) {
      return 'search-date'
    }
    return 'custom'
  }

  /** Gets the search type ng-select harness. */
  public async getSearchTypeSelect(): Promise<TheSeamNgSelectHarness> {
    return this.locatorFor(TheSeamNgSelectHarness)()
  }

  /** Gets the current search type value (e.g. "Contains", "Equals", "Between"). */
  public async getSearchType(): Promise<string | null> {
    const select = await this.getSearchTypeSelect()
    return select.getValue()
  }

  /**
   * Selects a search type from the dropdown by its displayed label
   * (e.g. `'Before'`, `'Contains'`, `'Between'`).
   *
   * Note: this matches the visible option text, not the underlying form value
   * (e.g. pass `'Before'` not `'lt'`).
   */
  public async selectSearchType(label: string | RegExp): Promise<void> {
    const select = await this.getSearchTypeSelect()
    await select.clickOption({ label })
  }

  /** Gets the primary search input (formControlName="searchText"). */
  public async getSearchInput() {
    return this.locatorForOptional('input[formcontrolname="searchText"]')()
  }

  /** Gets the range start input (formControlName="fromText"). */
  public async getRangeStartInput() {
    return this.locatorForOptional('input[formcontrolname="fromText"]')()
  }

  /** Gets the range end input (formControlName="toText"). */
  public async getRangeEndInput() {
    return this.locatorForOptional('input[formcontrolname="toText"]')()
  }

  /**
   * Sets the primary search value.
   * Clears any existing value first, then types the new value.
   */
  public async setSearchValue(value: string): Promise<void> {
    const input = await this.getSearchInput()
    if (!input) {
      throw Error(
        'Search input not found. The current search type may not have a text input.',
      )
    }
    await input.clear()
    await input.sendKeys(value)
  }

  /**
   * Sets the range values (for "Between" search types on numeric/date filters).
   */
  public async setRangeValues(from: string, to: string): Promise<void> {
    const fromInput = await this.getRangeStartInput()
    const toInput = await this.getRangeEndInput()
    if (!fromInput || !toInput) {
      throw Error(
        'Range inputs not found. The current search type may not support range values.',
      )
    }
    await fromInput.clear()
    await fromInput.sendKeys(from)
    await toInput.clear()
    await toInput.sendKeys(to)
  }

  /** Clicks the "Clear" button to reset the filter. */
  public async clear(): Promise<void> {
    const buttons = await this.locatorForAll('button')()
    for (const btn of buttons) {
      if ((await btn.text()).trim() === 'Clear') {
        return btn.click()
      }
    }
    throw Error('Clear button not found.')
  }

  /** Clicks the "Apply" button (only present in submit mode). */
  public async apply(): Promise<void> {
    const submitBtn = await this.locatorForOptional('button[type="submit"]')()
    if (!submitBtn) {
      throw Error(
        'Apply button not found. The filter may be using valueChanges mode.',
      )
    }
    return submitBtn.click()
  }

  /** Whether the "Apply" button is present (submit mode). */
  public async hasApplyButton(): Promise<boolean> {
    return (await this.locatorForOptional('button[type="submit"]')()) !== null
  }

  /** Whether the "Clear" button is disabled (filter is already at default). */
  public async isClearDisabled(): Promise<boolean> {
    const buttons = await this.locatorForAll('button')()
    for (const btn of buttons) {
      if ((await btn.text()).trim() === 'Clear') {
        const disabled = await btn.getAttribute('disabled')
        return disabled !== null
      }
    }
    throw Error('Clear button not found.')
  }
}
