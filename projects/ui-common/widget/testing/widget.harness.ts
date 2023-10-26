import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

// import { TheSeamMenuHarness } from './menu.harness'
// import { animatingWait } from './utils'

/** A set of criteria that can be used to filter a list of `TheSeamWidgetHarness` instances. */
export interface TheSeamWidgetHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  // text?: string | RegExp;
}

export class TheSeamWidgetHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `WidgetComponent` instance. */
  static hostSelector = 'seam-widget'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamWidgetHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamWidgetHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      // .addOption('text', options.text, (harness, text) =>
      //   HarnessPredicate.stringMatches(harness.getText(), text),
      // )
      // .addOption(
      //   'hasSubmenu',
      //   options.hasSubmenu,
      //   async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu,
      // )
  }

  /** Whether the menu is disabled. */
  // async isDisabled(): Promise<boolean> {
  //   const disabled = (await this.host()).getAttribute('disabled')
  //   return coerceBooleanProperty(await disabled)
  // }

  /** Gets the text of the menu item. */
  // async getText(): Promise<string> {
  //   return (await this.host()).text()
  // }

  /** Focuses the menu item. */
  // async focus(): Promise<void> {
  //   return (await this.host()).focus().then(() => animatingWait())
  // }

  /** Blurs the menu item. */
  // async blur(): Promise<void> {
  //   return (await this.host()).blur().then(() => animatingWait())
  // }

  /** Whether the menu item is focused. */
  // async isFocused(): Promise<boolean> {
  //   return (await this.host()).isFocused()
  // }

  /** Clicks the menu item. */
  // async click(): Promise<void> {
  //   return (await this.host()).click().then(() => animatingWait())
  // }

  /** Hovers the menu item. */
  // async hover(): Promise<void> {
  //   return (await this.host()).hover().then(() => animatingWait())
  // }

  /** Whether this item has a submenu. */
  // async hasSubmenu(): Promise<boolean> {
  //   return (await this.host()).matchesSelector(TheSeamMenuHarness.hostSelector)
  // }

  /** Gets the submenu associated with this menu item, or null if none. */
  // async getSubmenu(): Promise<TheSeamMenuHarness | null> {
  //   if (await this.hasSubmenu()) {
  //     return new TheSeamMenuHarness(this.locatorFactory)
  //   }
  //   return null
  // }
}
