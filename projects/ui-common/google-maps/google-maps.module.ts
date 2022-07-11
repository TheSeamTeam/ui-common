import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { AgmCoreModule } from '@agm/core'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamGoogleMapsRecenterButtonControlComponent } from './google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsUploadButtonControlComponent } from './google-maps-upload-button-control/google-maps-upload-button-control.component'
import { TheSeamGoogleMapsWrapperComponent } from './google-maps-wrapper/google-maps-wrapper.component'
import { TheSeamMapFileDropComponent } from './map-file-drop/map-file-drop.component'

@NgModule({
  declarations: [
    TheSeamGoogleMapsWrapperComponent,
    TheSeamMapFileDropComponent,
    TheSeamGoogleMapsUploadButtonControlComponent,
    TheSeamGoogleMapsRecenterButtonControlComponent,
  ],
  imports: [
    CommonModule,
    ObserversModule,
    TheSeamSharedModule,
    TheSeamMenuModule,
    TheSeamIconModule,
    AgmCoreModule,
    // AgmCoreModule.forRoot({
    //   // TODO: Add a way to set the api key.
    //   // apiKey: ,
    //   libraries: ['drawing', 'places'],
    // }),
  ],
  exports: [
    TheSeamGoogleMapsWrapperComponent,
  ]
})
export class TheSeamGoogleMapsModule { }
