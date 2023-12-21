import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'
import { TheSeamButtonComponentHarness } from '@theseam/ui-common/buttons'
import { TheSeamMenuHarness } from '@theseam/ui-common/menu'

interface TheSeamSchemaFormSubmitSplitHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormSubmitSplitHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-submit-split'

  private readonly _button = this.locatorFor(TheSeamButtonComponentHarness.with({ type: 'submit' }))
  private readonly _triggerButton = this.locatorFor(TheSeamButtonComponentHarness.with({ type: 'button' }))
  private readonly _menu = this.locatorForOptional(TheSeamMenuHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamSchemaFormSubmitSplitHarness`. */
  static with(options: TheSeamSchemaFormSubmitSplitHarnessFilters): HarnessPredicate<TheSeamSchemaFormSubmitSplitHarness> {
    return new HarnessPredicate(TheSeamSchemaFormSubmitSplitHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await (await this._button()).host()).getAttribute('name')
  }

  public async isDisabled(): Promise<boolean> {
    return (await this._button()).isDisabled()
  }

  public async isRequired(): Promise<boolean> {
    const required = (await (await this._button()).host()).getAttribute('required')
    return coerceBooleanProperty(await required)
  }

  public async click(): Promise<void> {
    return (await this._button()).click()
  }

  public async getMenu(): Promise<TheSeamMenuHarness> {
    const menu = await this._menu()
    if (menu === null) {
      throw Error('Menu not found.')
    }
    return menu
  }

  public async openMenu(): Promise<void> {
    const btn = await this._triggerButton()
    if (btn === null) {
      throw Error('Menu trigger button not found.')
    }
    await btn.click()
  }
}
