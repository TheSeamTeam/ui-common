import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarnessConstructor, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { waitOnConditionAsync } from '@theseam/ui-common/utils'

import { TheSeamMenuHarness } from './menu.harness'

/**
 * Workaround to wait on the animation to finish in browser, until a generic
 * broswer-based solution is added, for Storybook interactions.
 */
async function animatingWait() {
  const selectAnimating = () => document.querySelectorAll('.seam-menu-container .ng-animating')
  if (selectAnimating().length === 0) {
    return
  }
  await waitOnConditionAsync(() => selectAnimating().length === 0, 1000)
}

/** A set of criteria that can be used to filter a list of `TheSeamMenuItemHarness` instances. */
export interface TheSeamMenuItemHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances that have a sub-menu. */
  hasSubmenu?: boolean;
}

export class TheSeamMenuItemHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatMenuItem` instance. */
  static hostSelector = '.seam-menu-item'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamMenuItemHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamMenuItemHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'hasSubmenu',
        options.hasSubmenu,
        async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu,
      )
  }

  /** Whether the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  /** Gets the text of the menu item. */
  async getText(): Promise<string> {
    return (await this.host()).text()
  }

  /** Focuses the menu item. */
  async focus(): Promise<void> {
    return (await this.host()).focus().then(() => animatingWait())
  }

  /** Blurs the menu item. */
  async blur(): Promise<void> {
    return (await this.host()).blur().then(() => animatingWait())
  }

  /** Whether the menu item is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused()
  }

  /** Clicks the menu item. */
  async click(): Promise<void> {
    return (await this.host()).click().then(() => animatingWait())
  }

  /** Hovers the menu item. */
  async hover(): Promise<void> {
    return (await this.host()).hover().then(() => animatingWait())
  }

  /** Whether this item has a submenu. */
  async hasSubmenu(): Promise<boolean> {
    return (await this.host()).matchesSelector(TheSeamMenuHarness.hostSelector)
  }

  /** Gets the submenu associated with this menu item, or null if none. */
  async getSubmenu(): Promise<TheSeamMenuHarness | null> {
    if (await this.hasSubmenu()) {
      return new TheSeamMenuHarness(this.locatorFactory)
    }
    return null
  }
}
