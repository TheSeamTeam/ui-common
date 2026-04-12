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
  private readonly _iconContainers = this.locatorForAll(
    '.password-validators-list--item-icon',
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

  /**
   * Returns the CSS classes on each item's icon container.
   * When a validator passes, the seam-icon inside gets `text-success`;
   * when it fails, `text-danger`. If no icon is shown (pristine), the
   * container text will be empty.
   */
  async getIconContainerTexts(): Promise<string[]> {
    const containers = await this._iconContainers()
    return Promise.all(containers.map(async (c) => (await c.text()).trim()))
  }
}
