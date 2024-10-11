import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

export interface TheSeamNgSelectOptionHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the field. */
  value?: string | RegExp
}

export class TheSeamNgSelectOptionHarness extends ComponentHarness {
  static hostSelector = '.ng-option'

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamNgSelectOptionHarnessFilters): HarnessPredicate<TheSeamNgSelectOptionHarness> {
    return new HarnessPredicate(TheSeamNgSelectOptionHarness, options)
        .addOption('option value', options.value,
            (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value))
  }

  /**
   * NOTE: Only works with string values, curently.
   * @returns value of the select option
   */
  public async getValue(): Promise<any> {
    return (await this.host()).text()
  }

  /** Whether the ng-select is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  public async click(): Promise<void> {
    return (await this.host()).click()
  }
}
