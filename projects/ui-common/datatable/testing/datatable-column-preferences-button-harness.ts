import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import { TheSeamCheckboxHarness } from '@theseam/ui-common/checkbox'
import {
  TheSeamMenuHarness,
  TheSeamMenuItemHarness,
} from '@theseam/ui-common/menu'

export type TheSeamDatatableColumnPreferencesButtonHarnessFilters =
  BaseHarnessFilters

export class TheSeamDatatableColumnPreferencesButtonHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-column-preferences-button'

  private _documentRootLocator = this.documentRootLocatorFactory()

  static with<T extends TheSeamDatatableColumnPreferencesButtonHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableColumnPreferencesButtonHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private async _getMenuHarness(): Promise<TheSeamMenuHarness> {
    return this.locatorFor(TheSeamMenuHarness)()
  }

  /** Opens the preferences menu by clicking the button. */
  public async open(): Promise<void> {
    return (await this._getMenuHarness()).open()
  }

  /** Closes the preferences menu. */
  public async close(): Promise<void> {
    return (await this._getMenuHarness()).close()
  }

  /** Whether the preferences menu is open. */
  public async isOpen(): Promise<boolean> {
    return (await this._getMenuHarness()).isOpen()
  }

  /**
   * Opens the "Show/Hide Columns" popover and returns the checkbox harnesses
   * for each column. The checkboxes are rendered inside a CDK overlay popover.
   */
  public async getColumnCheckboxes(): Promise<TheSeamCheckboxHarness[]> {
    await this.open()
    const menu = await this._getMenuHarness()
    const items = await menu.getItems({ text: /Show\/Hide Columns/ })
    if (items.length === 0) {
      throw Error('"Show/Hide Columns" menu item not found.')
    }
    await items[0].click()
    // The column preferences component renders in a popover (CDK overlay)
    return this._documentRootLocator.locatorForAll(TheSeamCheckboxHarness)()
  }

  /**
   * Toggles a column's visibility by name.
   * Opens the Show/Hide Columns popover and clicks the matching checkbox.
   */
  public async toggleColumn(name: string | RegExp): Promise<void> {
    const checkboxes = await this.getColumnCheckboxes()
    for (const checkbox of checkboxes) {
      const host = await checkbox.host()
      const text = await host.text()
      const matches =
        typeof name === 'string' ? text.trim() === name : name.test(text.trim())
      if (matches) {
        await checkbox.click()
        return
      }
    }
    throw Error(`Column checkbox matching "${name}" not found.`)
  }

  /** Clicks the "Reset Columns" menu item. */
  public async resetColumns(): Promise<void> {
    const menu = await this._getMenuHarness()
    await menu.clickItem({ text: /Reset Columns/ })
  }
}
