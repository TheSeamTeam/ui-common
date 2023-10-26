import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamBaseButtonComponentHarness, TheSeamBaseButtonComponentHarnessFilters, createBaseButtonComponentHarnessPredicate } from './base-button.harness'

/** A set of criteria that can be used to filter a list of `TheSeamToggleButtonComponentHarness` instances. */
export interface TheSeamToggleButtonComponentHarnessFilters extends TheSeamBaseButtonComponentHarnessFilters { }

export class TheSeamToggleButtonComponentHarness extends TheSeamBaseButtonComponentHarness {

  /** The selector for the host element of a `TheSeamToggleButtonComponent` instance. */
  static hostSelector = 'button[seamToggleButton]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button item with specific attributes.
   * @param options Options for filtering which button item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamToggleButtonComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamToggleButtonComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return createBaseButtonComponentHarnessPredicate(this, options)
  }

  /**
   * Clicks the button.
   */
  public async click() {
    return (await this.host()).click()
  }

  /** Gets the theme of the button item. */
  async isActive(): Promise<boolean> {
    return (await this.host()).getAttribute('class')
      .then(c => (c?.split(' ').indexOf('active') !== -1) || false)
  }
}
