import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { animatingWait } from './utils'

/** A set of criteria that can be used to filter a list of `TheSeamMenuFooterHarness` instances. */
export interface TheSeamMenuFooterHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

export class TheSeamMenuFooterHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MenuFooterComponent` instance. */
  static hostSelector = 'seam-menu-footer'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamMenuFooterHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamMenuFooterHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
  }

  /** Gets the text of the menu item. */
  async getText(): Promise<string> {
    return (await this.host()).text()
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
