import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { AgmCoreModule } from '@agm/core'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamEditControlsWrapperComponent } from './edit-controls-wrapper/edit-controls-wrapper.component'
import { TheSeamEditControlsComponent } from './edit-controls/edit-controls.component'
import { TheSeamGoogleMapsWrapperComponent } from './google-maps/google-maps-wrapper.component'
import { TheSeamMapComponent } from './map.component'

@NgModule({
  declarations: [
    TheSeamMapComponent,
    TheSeamGoogleMapsWrapperComponent,
    TheSeamEditControlsComponent,
    TheSeamEditControlsWrapperComponent,
  ],
  imports: [
    CommonModule,
    ObserversModule,
    TheSeamSharedModule,
    TheSeamIconModule,
    AgmCoreModule.forRoot({
      // TODO: Add a way to set the api key.
      // apiKey: ,
      libraries: ['drawing', 'places'],
    }),
  ],
  exports: [
    TheSeamMapComponent,
  ]
})
export class TheSeamMapModule { }
