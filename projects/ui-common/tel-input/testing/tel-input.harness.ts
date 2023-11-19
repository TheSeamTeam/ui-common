import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { waitOnConditionAsync } from '@theseam/ui-common/utils'

interface TheSeamTelInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamTelInputHarness extends ComponentHarness {
  static hostSelector = 'seam-tel-input'

  private readonly _input = this.locatorFor('input')

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamTelInputHarness`. */
  static with(options: TheSeamTelInputHarnessFilters): HarnessPredicate<TheSeamTelInputHarness> {
    return new HarnessPredicate(TheSeamTelInputHarness, options)
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

  public async click(): Promise<void> {
    return (await this._input()).click()
  }

  public async setValue(value: any): Promise<void> {
    await this._waitOnInstance()
    // TODO: Find out why setInputValue() doesn't update the FormControl.
    // return (await this._input()).setInputValue(value)
    await (await this._input()).click()
    await this._input().then(x => x.setInputValue(''))
    return (await this._input()).sendKeys(value)
  }

  private async _waitOnInstance() {
    const input = document.querySelector('input')
    const isInstanceReady = () => {
      const instLoading = input?.getAttribute('instance-loading')
      return instLoading === null
    }
    if (isInstanceReady()) {
      return true
    }
    await waitOnConditionAsync(
      isInstanceReady, 10000
    )
  }
}
