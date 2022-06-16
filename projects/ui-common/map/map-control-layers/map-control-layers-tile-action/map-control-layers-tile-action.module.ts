import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlLayersTileActionComponent } from './map-control-layers-tile-action.component'

@NgModule({
  declarations: [
    TheSeamMapControlLayersTileActionComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TheSeamMapControlLayersTileActionComponent,
  ]
})
export class TheSeamMapControlLayersTileActionModule { }
