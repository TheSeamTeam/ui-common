import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamCheckboxHarness } from '@theseam/ui-common/checkbox'
import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'
import { TheSeamNgSelectHarness, TheSeamNgSelectOptionHarness, TheSeamNgSelectOptionHarnessFilters } from '@theseam/ui-common/testing'

interface TheSeamSchemaFormSelectHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormSelectHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-select'

  private readonly _ngSelect = this.locatorFor(TheSeamNgSelectHarness)
  private readonly _requiredIndicator = this.locatorFor(TheSeamFormFieldRequiredIndicatorHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamSchemaFormSelectHarnessFilters): HarnessPredicate<TheSeamSchemaFormSelectHarness> {
    return new HarnessPredicate(TheSeamSchemaFormSelectHarness, options)
        // .addOption('field name', options.name,
        //     (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await this._ngSelect()).getName()
  }

  public async getValue(): Promise<any> {
    return (await this._ngSelect()).getValue()
  }

  /**
   * Gets a list of `TheSeamNgSelectOptionHarness` representing the options in the dropdown.
   *
   * NOTE: Must open the dropdown first. eg. `await ngSelectHarness.click()`
   *
   * @param filters Optionally filters which menu items are included.
   */
  async getOptions(
    filters?: Omit<TheSeamNgSelectOptionHarnessFilters, 'ancestor'>,
  ): Promise<TheSeamNgSelectOptionHarness[]> {
    return (await this._ngSelect()).getOptions(filters)
  }

  /**
   * Clicks an option in the dropdown.
   * @param optionFilter A filter used to represent which option in the dropdown should be clicked. The
   *     first matching dropdown option will be clicked.
   */
  async clickOption(
    optionFilter: Omit<TheSeamNgSelectOptionHarnessFilters, 'ancestor'>
  ): Promise<void> {
    return (await this._ngSelect()).clickOption(optionFilter)
  }

  public async isDisabled(): Promise<boolean> {
    return (await this._ngSelect()).isDisabled()
  }

  public async isRequired(): Promise<boolean> {
    return (await this._ngSelect()).isRequired()
  }

  public async hasRequiredIndicator(): Promise<boolean> {
    return (await this._requiredIndicator()).isIndicatorVisible()
  }

  // public async click(): Promise<void> {
  //   return (await this._checkbox()).click()
  // }
}
