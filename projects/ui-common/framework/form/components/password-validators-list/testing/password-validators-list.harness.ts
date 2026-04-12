import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing'

export class TheSeamPasswordValidatorsListHarness extends ComponentHarness {
  static hostSelector = 'seam-password-validators-list'

  private readonly _header = this.locatorFor(
    '.password-validators-list--header',
  )
  private readonly _items = this.locatorForAll(
    '.password-validators-list--item',
  )

  static with(
    options: BaseHarnessFilters = {},
  ): HarnessPredicate<TheSeamPasswordValidatorsListHarness> {
    return new HarnessPredicate(TheSeamPasswordValidatorsListHarness, options)
  }

  async getHeaderText(): Promise<string> {
    return (await this._header()).text()
  }

  async getItemCount(): Promise<number> {
    return (await this._items()).length
  }

  async getItemMessages(): Promise<string[]> {
    const items = await this._items()
    return Promise.all(items.map(async (item) => (await item.text()).trim()))
  }

  /** Number of items showing a success (check) icon. */
  async getSuccessCount(): Promise<number> {
    const icons = await this.locatorForAll(
      '.password-validators-list--item-icon seam-icon.text-success',
    )()
    return icons.length
  }

  /** Number of items showing an error (x) icon. */
  async getErrorCount(): Promise<number> {
    const icons = await this.locatorForAll(
      '.password-validators-list--item-icon seam-icon.text-danger',
    )()
    return icons.length
  }

  /** Total number of items showing any icon. */
  async getIconCount(): Promise<number> {
    const icons = await this.locatorForAll(
      '.password-validators-list--item-icon seam-icon',
    )()
    return icons.length
  }
}
