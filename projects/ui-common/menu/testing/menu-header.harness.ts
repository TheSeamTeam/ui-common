import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { animatingWait } from './utils'

/** A set of criteria that can be used to filter a list of `TheSeamMenuHeaderHarness` instances. */
export interface TheSeamMenuHeaderHarnessFilters extends BaseHarnessFilters { }

export class TheSeamMenuHeaderHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MenuHeaderComponent` instance. */
  static hostSelector = 'seam-menu-header'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamMenuHeaderHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamMenuHeaderHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  /** Clicks the menu item. */
  async click(): Promise<void> {
    return (await this.host()).click().then(() => animatingWait())
  }

  /** Hovers the menu item. */
  async hover(): Promise<void> {
    return (await this.host()).hover().then(() => animatingWait())
  }

}
