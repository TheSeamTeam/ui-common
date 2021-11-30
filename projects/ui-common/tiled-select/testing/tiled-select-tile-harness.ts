import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TiledSelectItem } from '../tiled-select.models'

interface TheSeamTiledSelectTileHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the tile index of the tile. */
  tileIndex?: number | string | RegExp

  /** Filters based on the tile name of the tile. */
  tileName?: string | RegExp
}

export class TheSeamTiledSelectTileHarness extends ComponentHarness {
  static hostSelector = 'seam-tiled-select-tile'

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamTiledSelectTileHarnessFilters): HarnessPredicate<TheSeamTiledSelectTileHarness> {
    return new HarnessPredicate(TheSeamTiledSelectTileHarness, options)
        .addOption('tile index', options.tileIndex,
            (harness, index) => HarnessPredicate.stringMatches(harness.getTileIndex(), `${index}`))
        .addOption('tile name', options.tileName,
            (harness, name) => HarnessPredicate.stringMatches(harness.getTileName(), name))
  }

  public async getTileIndex() {
    return (await this.host()).getAttribute('data-tile-index')
  }

  public async getTileName(): Promise<string | null> {
    return (await this.host()).getAttribute('data-tile-name')
  }

  public async getValue(): Promise<any> {
    return (await this.host()).getProperty('value')
  }

  public async getButtonElement() {
    return this.locatorFor('button')()
  }
}
