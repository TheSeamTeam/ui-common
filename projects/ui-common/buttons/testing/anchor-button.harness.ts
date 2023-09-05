import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

// import { TheSeamMenuHarness } from './button.harness'
// import { animatingWait } from './utils'

import { TheSeamBaseButtonComponentHarness, TheSeamBaseButtonComponentHarnessFilters, createBaseButtonComponentHarnessPredicate } from './base-button.harness'

/** A set of criteria that can be used to filter a list of `TheSeamAnchorButtonComponentHarness` instances. */
export interface TheSeamAnchorButtonComponentHarnessFilters extends TheSeamBaseButtonComponentHarnessFilters { }

export class TheSeamAnchorButtonComponentHarness extends TheSeamBaseButtonComponentHarness {

  /** The selector for the host element of a `TheSeamAnchorButtonComponent` instance. */
  static hostSelector = 'a[seamButton]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button item with specific attributes.
   * @param options Options for filtering which button item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamAnchorButtonComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamAnchorButtonComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return createBaseButtonComponentHarnessPredicate(this, options)
  }

  async getTabIndex(): Promise<number> {
    const tabIndex = await (await this.host()).getAttribute('tabindex')
    return Number(tabIndex)
  }

}
