import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'
import { TheSeamNgSelectOptionHarness, TheSeamNgSelectOptionHarnessFilters } from './ng-select-option.harness'
import { TheSeamNgSelectDropdownHarness, TheSeamNgSelectDropdownHarnessFilters } from './ng-select-dropdown.harness'

export interface TheSeamNgSelectHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  // name?: string | RegExp
}

export class TheSeamNgSelectHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory()

  static hostSelector = 'ng-select'

  private readonly _value = this.locatorForOptional('.ng-value')
  private readonly _valueLabel = this.locatorForOptional('.ng-value-label')

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamNgSelectHarnessFilters): HarnessPredicate<TheSeamNgSelectHarness> {
    return new HarnessPredicate(TheSeamNgSelectHarness, options)
        // .addOption('field name', options.name,
        //     (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getId(): Promise<string | null> {
    return (await this.getInputElement()).getAttribute('id')
  }

  public async getAriaControls(): Promise<string | null> {
    return (await this.getInputElement()).getAttribute('aria-controls')
  }

  public async getName(): Promise<string | null> {
    return (await this.getInputElement()).getAttribute('name')
  }

  /**
   * NOTE: Only works with string values, curently.
   * @returns value of the select
   */
  public async getValue(): Promise<any> {
    const valueLabel = await this._valueLabel()
    if (valueLabel === null) {
      const value = await this._value()
      if (value === null) {
        return null
      }

      return value.text()
    }

    return valueLabel.text()
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
    const dropdown = await this._getDropdown()
    if (dropdown === null) {
      return []
    }

    return dropdown.getOptions(filters)
  }

  /**
   * Clicks an option in the dropdown.
   * @param optionFilter A filter used to represent which option in the dropdown should be clicked. The
   *     first matching dropdown option will be clicked.
   */
  async clickOption(
    optionFilter: Omit<TheSeamNgSelectOptionHarnessFilters, 'ancestor'>
  ): Promise<void> {
    await this.click()
    const dropdown = await this._getDropdown()
    if (dropdown === null) {
      throw Error(`Could not find dropdown.`)
    }

    return dropdown.clickOption(optionFilter)
  }

  /** Whether the ng-select is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  /**
   * Returns the required state of the ng-select.
   *
   * @returns true if the ng-select is required, false if not
   */
  public async isRequired(): Promise<boolean> {
    const required = await (await this.host()).getAttribute('required')
    return required === undefined ? true : coerceBooleanProperty(required)
  }

  public async click(): Promise<void> {
    return (await this.getInputElement()).click()
  }

  /**
   * Returns the input element of the checkbox.
   *
   * @returns the input element of the checkbox
   */
  public async getInputElement() {
    return this.locatorFor('input')()
  }

  private async _getDropdown(): Promise<TheSeamNgSelectDropdownHarness | null> {
    const ariaControls = await this.getAriaControls()
    if (ariaControls) {
      return this._documentRootLocator.locatorForOptional(
        TheSeamNgSelectDropdownHarness.with({
          id: ariaControls,
        } satisfies TheSeamNgSelectDropdownHarnessFilters),
      )()
    }
    return null
  }
}
