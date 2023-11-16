import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'

interface TheSeamSchemaFormNumberHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormNumberHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-number'

  private readonly _input = this.locatorFor('input')
  private readonly _requiredIndicator = this.locatorFor(TheSeamFormFieldRequiredIndicatorHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamSchemaFormNumberHarnessFilters): HarnessPredicate<TheSeamSchemaFormNumberHarness> {
    return new HarnessPredicate(TheSeamSchemaFormNumberHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name')
  }

  public async getValue(): Promise<any> {
    return (await this._input()).getProperty('value')
  }

  public async isDisabled(): Promise<boolean> {
    return (await this._input()).getProperty('disabled')
  }

  public async isRequired(): Promise<boolean> {
    return (await this._input()).getProperty('required')
  }

  public async hasRequiredIndicator(): Promise<boolean> {
    return (await this._requiredIndicator()).isIndicatorVisible()
  }

  public async click(): Promise<void> {
    return (await this._input()).click()
  }

  public async setValue(value: any): Promise<void> {
    // TODO: Find out why setInputValue() doesn't update the FormControl.
    // return (await this._input()).setInputValue(value)
    return (await this._input()).sendKeys(value)
  }
}
