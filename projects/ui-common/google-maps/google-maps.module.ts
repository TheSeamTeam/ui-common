import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { AgmCoreModule } from '@agm/core'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamGoogleMapsPlacesAutoCompleteComponent } from './google-maps-places-autocomplete/google-maps-places-autocomplete.component'
import { TheSeamGoogleMapsPlacesAutocompleteDirective } from './google-maps-places-autocomplete/google-maps-places-autocomplete.directive'
import { TheSeamGoogleMapsRecenterButtonControlComponent } from './google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsUploadButtonControlComponent } from './google-maps-upload-button-control/google-maps-upload-button-control.component'
import { TheSeamGoogleMapsComponent } from './google-maps/google-maps.component'
import { TheSeamMapsControlComponent } from './map-control.component'
import { TheSeamMapFileDropComponent } from './map-file-drop/map-file-drop.component'

@NgModule({
  declarations: [
    TheSeamGoogleMapsComponent,
    TheSeamMapFileDropComponent,
    TheSeamGoogleMapsUploadButtonControlComponent,
    TheSeamGoogleMapsRecenterButtonControlComponent,
    TheSeamMapsControlComponent,
    TheSeamGoogleMapsPlacesAutocompleteDirective,
    TheSeamGoogleMapsPlacesAutoCompleteComponent,
  ],
  imports: [
    CommonModule,
    ObserversModule,
    TheSeamSharedModule,
    TheSeamMenuModule,
    TheSeamIconModule,
    TheSeamFormFieldModule,
    AgmCoreModule,
  ],
  exports: [
    TheSeamGoogleMapsComponent,
    TheSeamGoogleMapsPlacesAutocompleteDirective,
    TheSeamGoogleMapsPlacesAutoCompleteComponent
  ]
})
export class TheSeamGoogleMapsModule { }
