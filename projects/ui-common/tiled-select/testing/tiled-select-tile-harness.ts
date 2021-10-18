import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

import { TiledSelectItem } from '../tiled-select.models'

interface TheSeamTiledSelectTileHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the tile index of the tile. */
  tileIndex?: number | string | RegExp
}

export class TheSeamTiledSelectTileHarness extends ComponentHarness {
  static hostSelector = 'seam-tiled-select-tile'

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamTiledSelectTileHarnessFilters): HarnessPredicate<TheSeamTiledSelectTileHarness> {
    return new HarnessPredicate(TheSeamTiledSelectTileHarness, options)
        .addOption('tile index', options.tileIndex,
            (harness, index) => HarnessPredicate.stringMatches(harness.getTileIndex(), `${index}`))
  }

  public async getTileIndex() {
    return (await this.host()).getAttribute('data-tile-index')
  }

  public async getTileName(): Promise<TiledSelectItem['name'] | null> {
    return (await this.host()).getAttribute('data-tile-name')
  }

  public async getValue(): Promise<any> {
    return (await this.host()).getProperty('value')
  }
}
