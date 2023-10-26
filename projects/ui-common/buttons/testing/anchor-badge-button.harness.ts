import { ComponentHarnessConstructor, HarnessPredicate } from '@angular/cdk/testing'

import { TheSeamBaseBadgeButtonComponentHarness, TheSeamBaseBadgeButtonComponentHarnessFilters, createBaseBadgeButtonComponentHarnessPredicate } from './base-badge-button.harness'

/** A set of criteria that can be used to filter a list of `TheSeamAnchorBadgeButtonComponentHarness` instances. */
export interface TheSeamAnchorBadgeButtonComponentHarnessFilters extends TheSeamBaseBadgeButtonComponentHarnessFilters { }

export class TheSeamAnchorBadgeButtonComponentHarness extends TheSeamBaseBadgeButtonComponentHarness {

  /** The selector for the host element of a `TheSeamAnchorBadgeButtonComponent` instance. */
  static hostSelector = 'a[seamBadgeButton]'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button item with specific attributes.
   * @param options Options for filtering which button item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamAnchorBadgeButtonComponentHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamAnchorBadgeButtonComponentHarnessFilters = {},
  ): HarnessPredicate<T> {
    return createBaseBadgeButtonComponentHarnessPredicate(this, options)
  }

  async getTabIndex(): Promise<number> {
    const tabIndex = await (await this.host()).getAttribute('tabindex')
    return Number(tabIndex)
  }

}
