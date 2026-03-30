import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

export interface TheSeamDatatableCellHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text content of the cell. */
  text?: string | RegExp
}

export class TheSeamDatatableCellHarness extends ComponentHarness {
  static hostSelector = '.datatable-body-cell'

  static with<T extends TheSeamDatatableCellHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableCellHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'text',
      options.text,
      (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
    )
  }

  /** Gets the text content of the cell. */
  public async getText(): Promise<string> {
    return (await this.host()).text()
  }

  /** Clicks the cell. */
  public async click(): Promise<void> {
    return (await this.host()).click()
  }

  /**
   * Gets a child harness of the given type from within this cell.
   * Useful for retrieving cell-type harnesses (e.g., currency, date, icon).
   *
   * Returns `null` if no matching harness is found.
   */
  public async getCellTypeHarness<T extends ComponentHarness>(
    harnessType: ComponentHarnessConstructor<T>,
  ): Promise<T | null> {
    return this.locatorForOptional(harnessType)()
  }
}
