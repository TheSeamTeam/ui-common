import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlLayersTileComponent } from './map-control-layers-tile.component'

@NgModule({
  declarations: [
    TheSeamMapControlLayersTileComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TheSeamMapControlLayersTileComponent,
  ]
})
export class TheSeamMapControlLayersTileModule { }
