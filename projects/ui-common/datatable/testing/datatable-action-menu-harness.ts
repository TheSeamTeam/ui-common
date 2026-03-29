import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

import {
  TheSeamMenuHarness,
  TheSeamMenuItemHarness,
  TheSeamMenuItemHarnessFilters,
} from '@theseam/ui-common/menu'

export type TheSeamDatatableActionMenuHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableActionMenuHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-action-menu'

  static with<T extends TheSeamDatatableActionMenuHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableActionMenuHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private async _getMenuHarness(): Promise<TheSeamMenuHarness> {
    return this.locatorFor(TheSeamMenuHarness)()
  }

  /** Whether the action menu is open. */
  public async isOpen(): Promise<boolean> {
    return (await this._getMenuHarness()).isOpen()
  }

  /** Opens the action menu. */
  public async open(): Promise<void> {
    return (await this._getMenuHarness()).open()
  }

  /** Closes the action menu. */
  public async close(): Promise<void> {
    return (await this._getMenuHarness()).close()
  }

  /**
   * Gets the menu items in the action menu.
   * The menu must be opened first (call `open()`) or use `clickItem()` which opens automatically.
   */
  public async getItems(
    filters?: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
  ): Promise<TheSeamMenuItemHarness[]> {
    return (await this._getMenuHarness()).getItems(filters)
  }

  /**
   * Opens the menu and clicks an item by text.
   * Supports sub-menu navigation via additional filter arguments.
   */
  public async clickItem(
    itemFilter: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
    ...subItemFilters: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>[]
  ): Promise<void> {
    return (await this._getMenuHarness()).clickItem(
      itemFilter,
      ...subItemFilters,
    )
  }
}
