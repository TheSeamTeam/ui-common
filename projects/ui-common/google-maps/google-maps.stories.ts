import { moduleMetadata } from '@storybook/angular'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AgmCoreModule } from '@agm/core'
import { TheSeamGoogleMapsModule } from './google-maps.module'
import { TheSeamGoogleMapsComponent } from './google-maps/google-maps.component'

export default {
  title: 'GoogleMaps/Components',
  // component: TheSeamGoogleMapsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamGoogleMapsModule,
        AgmCoreModule.forRoot({
          // TODO: Add a way to set the api key.
          // apiKey: ,
          libraries: ['drawing', 'places'],
        }),
      ]
    })
  ],
}

export const Basic = ({ ...args }) => ({
  template: `<seam-google-maps seamHoverClass="border border-warning"></seam-google-maps>`
})

export const Control = ({ ...args }) => ({
  moduleMetadata: {
    imports: [
      ReactiveFormsModule
    ],
  },
  template: `
    <input type="text" />
    <seam-google-maps [formControl]="control"></seam-google-maps>
    <input type="text" />
    [{{ control.value | json }}]
  `,
  props: {
    control: new FormControl()
  }
})

export const Places = ({ ...args }) => ({
  template: `<input seamGoogleMapsPlacesAutocomplete />`,
  props: { }
})

export const PlacesComponent = ({ ...args }) => ({
  template: `<seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>`,
  props: { }
})

export const PlacesMapBind = ({ ...args }) => ({
  template: `
    <seam-google-maps-places-autocomplete></seam-google-maps-places-autocomplete>
    <seam-google-maps></seam-google-maps>
  `,
  props: { }
})