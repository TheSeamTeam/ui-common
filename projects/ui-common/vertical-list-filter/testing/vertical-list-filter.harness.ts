import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamVerticalListFilterHarness extends ComponentHarness {
  static hostSelector = 'seam-vertical-list-filter'

  _clearOptionElement = this.locatorForOptional(`.vertical-list-filter--clear`)

  public async clickValue(value: string) {
    const element = await this.locatorFor(`.vertical-list-filter--item[data-value="${value}"]`)()
    return element.click()
  }

  public async filterValue(): Promise<string | undefined> {
    const filterValue = await (await this.host()).getAttribute('data-filter-value')
    return filterValue ?? undefined
  }

  public async hasClearOption(): Promise<boolean> {
    const element = await this._clearOptionElement()
    return element !== null
  }

  public async clearFilter() {
    const element = await this._clearOptionElement()
    if (!element) {
      throw new Error('No clear option found.')
    }
    return element.click()
  }

}
