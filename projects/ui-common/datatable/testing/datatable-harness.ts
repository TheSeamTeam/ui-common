import { ComponentHarness } from '@angular/cdk/testing'

import { TheSeamDatatablePagerHarness } from './datatable-pager-harness'

export class TheSeamDatatableHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable'

  private readonly _pager = this.locatorFor(TheSeamDatatablePagerHarness)

  public async getCurrentPage(): Promise<number> {
    return (await this._pager()).getCurrentPageNumber()
  }

  public async getPager() {
    return this._pager()
  }

  // public getTileAtIndex(index: number) {
  //   const getTileAtIndex = this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
  //   return getTileAtIndex()
  //   // return this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
  // }

  // public async getTileByName(name: string) {

  // }
}
