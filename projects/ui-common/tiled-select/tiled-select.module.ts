import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TiledSelectTileIconComponent } from './components/tiled-select-tile-icon/tiled-select-tile-icon.component'
import { TiledSelectTileComponent } from './components/tiled-select-tile/tiled-select-tile.component'
import { TiledSelectComponent } from './components/tiled-select/tiled-select.component'
import { TiledSelectTileIconTplDirective } from './directives/tiled-select-tile-icon-tpl.directive'
import { TiledSelectTileLabelTplDirective } from './directives/tiled-select-tile-label-tpl.directive'
import { TiledSelectTileOverlayDirective } from './directives/tiled-select-tile-overlay.directive'

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  declarations: [
    TiledSelectComponent,
    TiledSelectTileComponent,
    TiledSelectTileOverlayDirective,
    TiledSelectTileIconComponent,
    TiledSelectTileIconTplDirective,
    TiledSelectTileLabelTplDirective
  ],
  exports: [
    TiledSelectComponent,
    TiledSelectTileComponent,
    TiledSelectTileOverlayDirective,
    TiledSelectTileIconTplDirective,
    TiledSelectTileLabelTplDirective
  ]
})
export class TheSeamTiledSelectModule { }
