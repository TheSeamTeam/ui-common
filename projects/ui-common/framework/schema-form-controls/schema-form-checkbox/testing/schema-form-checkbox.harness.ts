import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamCheckboxHarness } from '@theseam/ui-common/checkbox'
import { TheSeamFormFieldRequiredIndicatorHarness } from '@theseam/ui-common/form-field'

interface TheSeamSchemaFormCheckboxHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormCheckboxHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-checkbox'

  private readonly _checkbox = this.locatorFor(TheSeamCheckboxHarness)
  private readonly _requiredIndicator = this.locatorFor(TheSeamFormFieldRequiredIndicatorHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamSchemaFormCheckboxHarnessFilters): HarnessPredicate<TheSeamSchemaFormCheckboxHarness> {
    return new HarnessPredicate(TheSeamSchemaFormCheckboxHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await this._checkbox()).getName()
  }

  public async getValue(): Promise<any> {
    return (await this._checkbox()).isChecked()
  }

  public async isDisabled(): Promise<boolean> {
    return (await this._checkbox()).isDisabled()
  }

  public async isRequired(): Promise<boolean> {
    return (await this._checkbox()).isRequired()
  }

  public async hasRequiredIndicator(): Promise<boolean> {
    return (await this._requiredIndicator()).isIndicatorVisible()
  }

  public async click(): Promise<void> {
    return (await this._checkbox()).click()
  }
}
