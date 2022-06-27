import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { AgmCoreModule } from '@agm/core'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamGoogleMapsWrapperComponent } from './google-maps-wrapper/google-maps-wrapper.component'

@NgModule({
  declarations: [
    TheSeamGoogleMapsWrapperComponent,
  ],
  imports: [
    CommonModule,
    ObserversModule,
    TheSeamSharedModule,
    TheSeamMenuModule,
    AgmCoreModule.forRoot({
      // TODO: Add a way to set the api key.
      // apiKey: ,
      libraries: ['drawing', 'places'],
    }),
  ],
  exports: [
    TheSeamGoogleMapsWrapperComponent,
  ]
})
export class TheSeamGoogleMapsModule { }
