import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamMapControlLayersComponent } from './map-control-layers.component'
import { manifestProvider } from './map-control-layers.manifest'

@NgModule({
  declarations: [
    TheSeamMapControlLayersComponent,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    manifestProvider,
  ],
  exports: [
    TheSeamMapControlLayersComponent,
  ]
})
export class TheSeamMapControlLayersModule { }
