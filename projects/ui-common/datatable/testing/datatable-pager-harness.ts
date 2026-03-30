import { ComponentHarness } from '@angular/cdk/testing'

import { TheSeamDatatablePagerButtonHarness } from './datatable-pager-button-harness'

export class TheSeamDatatablePagerHarness extends ComponentHarness {
  static hostSelector = 'datatable-pager'

  private readonly _activePageButton = this.locatorFor('.pager .pages.active')

  public async getPageButtonHarness(
    pageNumber: number,
  ): Promise<TheSeamDatatablePagerButtonHarness> {
    const getBtnAtIndex = this.locatorFor(
      TheSeamDatatablePagerButtonHarness.with({ pageNumber }),
    )
    return getBtnAtIndex()
  }

  public async getCurrentPageNumber(): Promise<number> {
    const btn = await this._activePageButton()
    const label = await btn.getAttribute('aria-label')
    if (label === null) {
      throw Error(`Current page label not found.`)
    }
    return parseInt(label.replace('page ', ''), 10)
  }
}
