import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'
import { TheSeamNgSelectOptionHarness, TheSeamNgSelectOptionHarnessFilters } from './ng-select-option.harness'

export interface TheSeamNgSelectDropdownHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  id?: string | RegExp
}

export class TheSeamNgSelectDropdownHarness extends ComponentHarness {
  static hostSelector = 'ng-dropdown-panel'

  // private readonly _ngSelect = this.locatorFor(TheSeamNgSelectDropdownHarness)
  // private readonly _requiredIndicator = this.locatorFor(TheSeamFormFieldRequiredIndicatorHarness)
  // private readonly _valueLabel = this.locatorForOptional('.ng-value-label')
  // private readonly _options = this.locatorForOptional(TheSeamNgSelectOptionHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamNgSelectDropdownHarnessFilters): HarnessPredicate<TheSeamNgSelectDropdownHarness> {
    return new HarnessPredicate(TheSeamNgSelectDropdownHarness, options)
        .addOption('field id', options.id,
            (harness, id) => HarnessPredicate.stringMatches(harness.getId(), id))
  }

  public async getId(): Promise<string | null> {
    return (await this.host()).getAttribute('id')
  }

  /**
   * Gets a list of `TheSeamNgSelectOptionHarness` representing the items in the menu.
   * @param filters Optionally filters which menu items are included.
   */
  async getOptions(
    filters?: Omit<TheSeamNgSelectOptionHarnessFilters, 'ancestor'>,
  ): Promise<TheSeamNgSelectOptionHarness[]> {
    return this.locatorForAll(
      TheSeamNgSelectOptionHarness.with({
        ...(filters || {}),
      } satisfies TheSeamNgSelectOptionHarnessFilters),
    )()
  }

  /**
   * Clicks an option in the dropdown.
   * @param optionFilter A filter used to represent which option in the dropdown should be clicked. The
   *     first matching dropdown option will be clicked.
   */
  async clickOption(
    optionFilter: Omit<TheSeamNgSelectOptionHarnessFilters, 'ancestor'>
  ): Promise<void> {
    const options = await this.getOptions(optionFilter)
    if (!options.length) {
      throw Error(`Could not find option matching ${JSON.stringify(optionFilter)}`)
    }

    return options[0].click()
  }

}
