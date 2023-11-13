import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

interface JsonSchemaFormHarnessFilters extends BaseHarnessFilters { }

export class JsonSchemaFormHarness extends ComponentHarness {
  static hostSelector = 'json-schema-form'

  private readonly _form = this.locatorFor('form')

  /** Creates a `HarnessPredicate` used to locate a particular `JsonSchemaFormHarness`. */
  static with(options: JsonSchemaFormHarnessFilters): HarnessPredicate<JsonSchemaFormHarness> {
    return new HarnessPredicate(JsonSchemaFormHarness, options)
  }

  public async submit(): Promise<void> {
    return (await this._form()).dispatchEvent('submit')
  }
}
