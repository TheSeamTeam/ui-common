import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamBaseBadgeButtonComponentHarness, TheSeamBaseBadgeButtonComponentHarnessFilters, createBaseBadgeButtonComponentHarnessPredicate } from './base-badge-button.harness'

/** A set of criteria that can be used to filter a list of `TheSeamBadgeButtonComponentHarness` instances. */
export interface TheSeamBadgeButtonComponentHarnessFilters extends TheSeamBaseBadgeButtonComponentHarnessFilters { }

export class TheSeamBadgeButtonComponentHarness extends TheSeamBaseBadgeButtonComponentHarness {

  /** The selector for the host element of a `TheSeamBadgeButtonComponent` instance. */
  static hostSelector = 'button[seamBadgeButton]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button item with specific attributes.
   * @param options Options for filtering which button item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamBadgeButtonComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamBadgeButtonComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return createBaseBadgeButtonComponentHarnessPredicate(this, options)
  }

}
