import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

interface TheSeamFormFieldHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  // name?: string | RegExp

  label?: string
}

export class TheSeamFormFieldHarness extends ComponentHarness {
  static hostSelector = 'seam-form-field'

  private readonly _label = this.locatorFor('label')
  // private readonly _input = this.locatorFor('input')

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamFormFieldHarness`. */
  static with(options: TheSeamFormFieldHarnessFilters): HarnessPredicate<TheSeamFormFieldHarness> {
    return new HarnessPredicate(TheSeamFormFieldHarness, options)
        // .addOption('field name', options.name,
        //     (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
        .addOption('label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
  }

  public async getLabel(): Promise<string | null> {
    return (await this._label()).text()
  }

  public async clickLabel(): Promise<void> {
    await (await this._label()).click()
  }

  // public async getName(): Promise<string | null> {
  //   return (await this._input()).getAttribute('name')
  // }

  // public async getValue(): Promise<any> {
  //   return (await this._input()).getProperty('value')
  // }

  // public async isDisabled(): Promise<boolean> {
  //   return (await this._input()).getProperty('disabled')
  // }

  // public async isRequired(): Promise<boolean> {
  //   return (await this._input()).getProperty('required')
  // }

  // public async click(): Promise<void> {
  //   return (await this._input()).click()
  // }

  // public async setValue(value: any): Promise<void> {
  //   // TODO: Find out why setInputValue() doesn't update the FormControl.
  //   // return (await this._input()).setInputValue(value)
  //   await (await this._input()).click()
  //   await this._input().then(x => x.setInputValue(''))
  //   return (await this._input()).sendKeys(value)
  // }
}
