import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

export type TheSeamDatatableRefreshButtonHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableRefreshButtonHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-refresh-button'

  static with<T extends TheSeamDatatableRefreshButtonHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableRefreshButtonHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private readonly _button = this.locatorFor('button')

  /** Clicks the refresh button. */
  public async click(): Promise<void> {
    return (await this._button()).click()
  }

  /** Whether the underlying button is disabled. */
  public async isDisabled(): Promise<boolean> {
    const disabled = await (await this._button()).getAttribute('disabled')
    return coerceBooleanProperty(disabled)
  }
}
