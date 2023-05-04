import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

interface TheSeamCheckboxHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the id of the checkbox. */
  id?: number | string | RegExp

  /** Filters based on the name of the checkbox. */
  name?: string | RegExp
}

export class TheSeamCheckboxHarness extends ComponentHarness {
  static hostSelector = 'seam-checkbox'

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamCheckboxHarnessFilters): HarnessPredicate<TheSeamCheckboxHarness> {
    return new HarnessPredicate(TheSeamCheckboxHarness, options)
        .addOption('checkbox id', options.id,
            (harness, index) => HarnessPredicate.stringMatches(harness.getId(), `${index}`))
        .addOption('checkbox name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getId(): Promise<string | null> {
    return (await this.getInputElement()).getAttribute('id')
  }

  public async getName(): Promise<string | null> {
    return (await this.getInputElement()).getAttribute('name')
  }

  /**
   * Returns the checked state of the checkbox.
   *
   * @returns true if the checkbox is checked, false if not
   */
  public async isChecked(): Promise<boolean> {
    return (await this.getInputElement()).getProperty('checked')
  }

  /**
   * Returns the indeterminate state of the checkbox.
   *
   * @returns true if the checkbox is indeterminate, false if not
   */
  public async isIndeterminate(): Promise<boolean> {
    return (await this.getInputElement()).getProperty('indeterminate')
  }

  /**
   * Returns the disabled state of the checkbox.
   *
   * @returns true if the checkbox is disabled, false if not
   */
  public async isDisabled(): Promise<boolean> {
    return (await this.getInputElement()).getProperty('disabled')
  }

  /**
   * Returns the required state of the checkbox.
   *
   * @returns true if the checkbox is required, false if not
   */
  public async isRequired(): Promise<boolean> {
    return (await this.getInputElement()).getProperty('required')
  }

  /**
   * Clicks the checkbox.
   */
  public async click() {
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
}
