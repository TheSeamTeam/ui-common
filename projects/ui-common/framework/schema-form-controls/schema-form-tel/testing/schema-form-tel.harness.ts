import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing'

import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'
import { TheSeamTelInputHarness } from '@theseam/ui-common/tel-input'

interface TheSeamSchemaFormTelHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormTelHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-tel'

  // private readonly _input = this.locatorFor('input')
  private readonly _telInput = this.locatorFor(TheSeamTelInputHarness)
  private readonly _requiredIndicator = this.locatorFor(TheSeamFormFieldRequiredIndicatorHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamSchemaFormTelHarnessFilters): HarnessPredicate<TheSeamSchemaFormTelHarness> {
    return new HarnessPredicate(TheSeamSchemaFormTelHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    // return (await this._input()).getAttribute('name')
    return (await this._telInput()).getName()
  }

  public async getValue(): Promise<any> {
    // return (await this._input()).getProperty('value')
    return (await this._telInput()).getValue()
  }

  public async isDisabled(): Promise<boolean> {
    // return (await this._input()).getProperty('disabled')
    return (await this._telInput()).isDisabled()
  }

  public async isRequired(): Promise<boolean> {
    // return (await this._input()).getProperty('required')
    return (await this._telInput()).isRequired()
  }

  public async hasRequiredIndicator(): Promise<boolean> {
    return (await this._requiredIndicator()).isIndicatorVisible()
  }

  public async click(): Promise<void> {
    // return (await this._input()).click()
    return (await this._telInput()).click()
  }

  public async setValue(value: any): Promise<void> {
    // TODO: Find out why setInputValue() doesn't update the FormControl.
    // return (await this._input()).setInputValue(value)
    // await (await this._input()).click()
    // await this._input().then(x => x.setInputValue(''))
    // return (await this._input()).sendKeys(value)
    await (await this._telInput()).setValue(value)
  }
}
