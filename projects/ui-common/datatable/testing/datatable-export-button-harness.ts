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

export type TheSeamDatatableExportButtonHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableExportButtonHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-export-button'

  static with<T extends TheSeamDatatableExportButtonHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableExportButtonHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private async _getMenuHarness(): Promise<TheSeamMenuHarness> {
    return this.locatorFor(TheSeamMenuHarness)()
  }

  /** Opens the export menu. */
  public async open(): Promise<void> {
    return (await this._getMenuHarness()).open()
  }

  /** Closes the export menu. */
  public async close(): Promise<void> {
    return (await this._getMenuHarness()).close()
  }

  /** Whether the export menu is open. */
  public async isOpen(): Promise<boolean> {
    return (await this._getMenuHarness()).isOpen()
  }

  /** Whether the export button is disabled. */
  public async isDisabled(): Promise<boolean> {
    return (await this._getMenuHarness()).isDisabled()
  }

  /** Gets the exporter menu items. The menu must be opened first or use `clickExporter()`. */
  public async getExporters(
    filters?: Omit<TheSeamMenuItemHarnessFilters, 'ancestor'>,
  ): Promise<TheSeamMenuItemHarness[]> {
    return (await this._getMenuHarness()).getItems(filters)
  }

  /** Opens the menu and clicks an exporter by label. */
  public async clickExporter(label: string | RegExp): Promise<void> {
    return (await this._getMenuHarness()).clickItem({ text: label })
  }
}
