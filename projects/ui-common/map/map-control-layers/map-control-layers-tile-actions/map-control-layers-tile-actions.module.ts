import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlLayersTileActionsComponent } from './map-control-layers-tile-actions.component'

@NgModule({
  declarations: [
    TheSeamMapControlLayersTileActionsComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TheSeamMapControlLayersTileActionsComponent,
  ]
})
export class TheSeamMapControlLayersTileActionsModule { }
