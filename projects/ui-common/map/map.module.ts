import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

// import { TheSeamGoogleMapsModule } from '@theseam/ui-common/google-maps'

import { TheSeamMapControlLayersModule } from './map-control-layers/map-control-layers.module'
import { TheSeamMapControlModule } from './map-control/map-control.module'
import { TheSeamMapControlsMenuModule } from './map-controls-menu/map-controls-menu.module'
import { TheSeamMapComponent } from './map.component'

@NgModule({
  declarations: [
    TheSeamMapComponent,
  ],
  imports: [
    CommonModule,
    TheSeamMapControlModule,
    TheSeamMapControlsMenuModule,
    TheSeamMapControlLayersModule,
    // TheSeamGoogleMapsModule,
  ],
  exports: [
    TheSeamMapComponent,
    TheSeamMapControlsMenuModule,
    TheSeamMapControlModule,
  ]
})
export class TheSeamMapModule { }
