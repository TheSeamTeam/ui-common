import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing'

export interface TheSeamNgSelectOptionHarnessFilters
  extends BaseHarnessFilters {
  /** Filters based on the rendered text of the option. */
  label?: string | RegExp
}

export class TheSeamNgSelectOptionHarness extends ComponentHarness {
  static hostSelector = '.ng-option'

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamNgSelectOptionHarness`. */
  static with(
    options: TheSeamNgSelectOptionHarnessFilters,
  ): HarnessPredicate<TheSeamNgSelectOptionHarness> {
    return new HarnessPredicate(
      TheSeamNgSelectOptionHarness,
      options,
    ).addOption('option label', options.label, (harness, label) =>
      HarnessPredicate.stringMatches(harness.getLabel(), label),
    )
  }

  /**
   * Gets the rendered text of the option.
   *
   * Note: this returns the displayed label, not the bound value.
   */
  public async getLabel(): Promise<string> {
    return (await this.host()).text()
  }

  /** Whether the option is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  public async click(): Promise<void> {
    return (await this.host()).click()
  }
}
