import {
  BaseHarnessFilters,
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing'

export type TheSeamDatatableMenuBarHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableMenuBarHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = 'seam-datatable-menu-bar'

  static with<T extends TheSeamDatatableMenuBarHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableMenuBarHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  /** Gets the text content of the menu bar. */
  public async getTextContent(): Promise<string> {
    return (await this.host()).text()
  }
}
