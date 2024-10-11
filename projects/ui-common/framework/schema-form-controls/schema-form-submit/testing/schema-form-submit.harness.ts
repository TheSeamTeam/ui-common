import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

interface TheSeamSchemaFormSubmitHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormSubmitHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-submit'

  private readonly _input = this.locatorFor('input')

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamSchemaFormSubmitHarness`. */
  static with(options: TheSeamSchemaFormSubmitHarnessFilters): HarnessPredicate<TheSeamSchemaFormSubmitHarness> {
    return new HarnessPredicate(TheSeamSchemaFormSubmitHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name')
  }

  public async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  public async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required')
    return coerceBooleanProperty(await required)
  }

  public async click(): Promise<void> {
    return (await this._input()).click()
  }
}
