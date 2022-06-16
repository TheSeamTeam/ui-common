import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlLayersLayerComponent } from './map-control-layers-layer.component'

@NgModule({
  declarations: [
    TheSeamMapControlLayersLayerComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    TheSeamMapControlLayersLayerComponent,
  ]
})
export class TheSeamMapControlLayersLayerModule { }
