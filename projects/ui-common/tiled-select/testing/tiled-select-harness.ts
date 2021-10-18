import { ComponentHarness } from '@angular/cdk/testing'

import { TheSeamTiledSelectTileHarness } from './tiled-select-tile-harness'

export class TheSeamTiledSelectHarness extends ComponentHarness {
  static hostSelector = 'seam-tiled-select'

  public async getTiles() {
    return this.locatorForAll(TheSeamTiledSelectTileHarness)
  }

  public getTileAtIndex(index: number) {
    // const getTileAtIndex = this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
    // return getTileAtIndex()
    return this.locatorFor(TheSeamTiledSelectTileHarness.with({ tileIndex: index }))
  }

  // public async getTileByName(name: string) {

  // }
}
