import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

// import { TheSeamMenuHarness } from './button.harness'
// import { animatingWait } from './utils'

import { TheSeamBaseButtonComponentHarness, TheSeamBaseButtonComponentHarnessFilters, createBaseButtonComponentHarnessPredicate } from './base-button.harness'

/** A set of criteria that can be used to filter a list of `TheSeamButtonComponentHarness` instances. */
export interface TheSeamButtonComponentHarnessFilters extends TheSeamBaseButtonComponentHarnessFilters { }

export class TheSeamButtonComponentHarness extends TheSeamBaseButtonComponentHarness {

  /** The selector for the host element of a `TheSeamButtonComponent` instance. */
  static hostSelector = 'button[seamButton]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button item with specific attributes.
   * @param options Options for filtering which button item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamButtonComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamButtonComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return createBaseButtonComponentHarnessPredicate(this, options)
  }

}
