import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
  TestElement,
  TestKey,
  BaseHarnessFilters,
} from '@angular/cdk/testing'

import { waitOnConditionAsync } from '@theseam/ui-common/utils'

import { TheSeamMenuItemHarness, TheSeamMenuItemHarnessFilters } from './menu-item.harness'

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

/** A set of criteria that can be used to filter a list of `TheSeamMenuHarness` instances. */
export interface TheSeamMenuHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose trigger text matches the given value. */
  triggerText?: string | RegExp;
}

export class TheSeamMenuHarness extends ContentContainerComponentHarness<string> {
  private _documentRootLocator = this.documentRootLocatorFactory()

  /** The selector for the host element of a `MatMenu` instance. */
  static hostSelector = '.seam-menu-toggle'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for filtering which menu instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends TheSeamMenuHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamMenuHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'triggerText',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    )
  }

  /** Whether the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled')
    return coerceBooleanProperty(await disabled)
  }

  /** Whether the menu is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._getMenuPanel())
  }

  /** Gets the text of the menu's trigger element. */
  async getTriggerText(): Promise<string> {
    return (await this.host()).text()
  }

  /** Focuses the menu. */
  async focus(): Promise<void> {
    return (await this.host()).focus().then(() => animatingWait())
  }

  /** Blurs the menu. */
  async blur(): Promise<void> {
    return (await this.host()).blur().then(() => animatingWait())
  }

  /** Whether the menu is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused()
  }

  /** Opens the menu. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      return (await this.host()).click().then(() => animatingWait())
    }
  }

  /** Closes the menu. */
  async close(): Promise<void> {
    const panel = await this._getMenuPanel()
    if (panel) {
      return panel.sendKeys(TestKey.ESCAPE).then(() => animatingWait())
    }
  }

  /**
   * Gets a list of `TheSeamMenuItemHarness` representing the items in the menu.
   * @param filters Optionally filters which menu items are included.
   */
  async getItems(
    filters?: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
  ): Promise<TheSeamMenuItemHarness[]> {
    const panelId = await this._getPanelId()
    if (panelId) {
      return this._documentRootLocator.locatorForAll(
        TheSeamMenuItemHarness.with({
          ...(filters || {}),
          ancestor: `#${panelId}`,
        } as TheSeamMenuItemHarnessFilters),
      )()
    }
    return []
  }

  /**
   * Clicks an item in the menu, and optionally continues clicking items in subsequent sub-menus.
   * @param itemFilter A filter used to represent which item in the menu should be clicked. The
   *     first matching menu item will be clicked.
   * @param subItemFilters A list of filters representing the items to click in any subsequent
   *     sub-menus. The first item in the sub-menu matching the corresponding filter in
   *     `subItemFilters` will be clicked.
   */
  async clickItem(
    itemFilter: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
    ...subItemFilters: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>[]
  ): Promise<void> {
    await this.open()
    const items = await this.getItems(itemFilter)
    if (!items.length) {
      throw Error(`Could not find item matching ${JSON.stringify(itemFilter)}`)
    }

    if (!subItemFilters.length) {
      return items[0].click()
    }

    const menu = await items[0].getSubmenu()
    if (!menu) {
      throw Error(`Item matching ${JSON.stringify(itemFilter)} does not have a submenu`)
    }
    return menu.clickItem(...(subItemFilters as [Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>]))
  }

  /**
   * Hovers an item in the menu, and optionally continues hovering items in subsequent sub-menus.
   * @param itemFilter A filter used to represent which item in the menu should be hovered. The
   *     first matching menu item will be hovered.
   * @param subItemFilters A list of filters representing the items to hover in any subsequent
   *     sub-menus. The first item in the sub-menu matching the corresponding filter in
   *     `subItemFilters` will be hovered.
   */
  async hoverItem(
    itemFilter: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
    ...subItemFilters: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>[]
  ): Promise<void> {
    await this.open()
    const items = await this.getItems(itemFilter)
    if (!items.length) {
      throw Error(`Could not find item matching ${JSON.stringify(itemFilter)}`)
    }

    if (!subItemFilters.length) {
      return items[0].hover()
    }

    const menu = await items[0].getSubmenu()
    if (!menu) {
      throw Error(`Item matching ${JSON.stringify(itemFilter)} does not have a submenu`)
    }
    return menu.hoverItem(...(subItemFilters as [Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>]))
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const panelId = await this._getPanelId()
    return this.documentRootLocatorFactory().harnessLoaderFor(`#${panelId}`)
  }

  /** Gets the menu panel associated with this menu. */
  private async _getMenuPanel(): Promise<TestElement | null> {
    const panelId = await this._getPanelId()
    return panelId ? this._documentRootLocator.locatorForOptional(`#${panelId}`)() : null
  }

  /** Gets the id of the menu panel associated with this menu. */
  private async _getPanelId(): Promise<string | null> {
    const panelId = await (await this.host()).getAttribute('aria-controls')
    return panelId || null
  }

}
