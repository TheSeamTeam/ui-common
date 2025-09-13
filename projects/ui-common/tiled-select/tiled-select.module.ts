import { NgModule } from '@angular/core'

import { TheSeamTiledSelectTileComponent } from './components/tiled-select-tile/tiled-select-tile.component'
import { TheSeamTiledSelectComponent } from './components/tiled-select/tiled-select.component'
import { TheSeamTiledSelectTileIconTplDirective } from './directives/tiled-select-tile-icon-tpl.directive'
import { TheSeamTiledSelectTileLabelTplDirective } from './directives/tiled-select-tile-label-tpl.directive'
import { TheSeamTiledSelectTileOverlayDirective } from './directives/tiled-select-tile-overlay.directive'

@NgModule({
  imports: [
    TheSeamTiledSelectComponent,
    TheSeamTiledSelectTileComponent,
    TheSeamTiledSelectTileOverlayDirective,
    TheSeamTiledSelectTileIconTplDirective,
    TheSeamTiledSelectTileLabelTplDirective,
  ],
  exports: [
    TheSeamTiledSelectComponent,
    TheSeamTiledSelectTileComponent,
    TheSeamTiledSelectTileOverlayDirective,
    TheSeamTiledSelectTileIconTplDirective,
    TheSeamTiledSelectTileLabelTplDirective,
  ],
})
export class TheSeamTiledSelectModule { }
