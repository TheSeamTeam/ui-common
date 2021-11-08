import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamDatatablePagerHarness extends ComponentHarness {
  static hostSelector = 'datatable-pager'

  private readonly _activePageButton = this.locatorFor('.pager .pages.active')

  // public async getTiles() {
  //   return this.locatorForAll(TheSeamTiledSelectTileHarness)
  // }

  // public getTileAtIndex(index: number) {
  //   const getTileAtIndex = this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
  //   return getTileAtIndex()
  //   // return this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
  // }

  // public async getTileByName(name: string) {

  // }

  public async getCurrentPageNumber(): Promise<number> {
    const btn = await this._activePageButton()
    const label = await btn.getAttribute('aria-label')
    if (label === null) {
      throw Error(`Current page label not found.`)
    }
    return parseInt(label.replace('page ', ''), 10)
  }
}
