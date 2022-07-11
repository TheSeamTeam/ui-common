import { moduleMetadata } from '@storybook/angular'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamGoogleMapsWrapperComponent } from './google-maps-wrapper/google-maps-wrapper.component'
import { TheSeamGoogleMapsModule } from './google-maps.module'
import { AgmCoreModule } from '@agm/core'

export default {
  title: 'GoogleMaps/Components',
  // component: TheSeamGoogleMapsWrapperComponent,
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
  template: `<seam-google-maps-wrapper seamHoverClass="border border-warning"></seam-google-maps-wrapper>`
})

export const Control = ({ ...args }) => ({
  moduleMetadata: {
    imports: [
      ReactiveFormsModule
    ],
  },
  template: `
    <input type="text" />
    <seam-google-maps-wrapper [formControl]="control"></seam-google-maps-wrapper>
    <input type="text" />
    [{{ control.value | json }}]
  `,
  props: {
    control: new FormControl()
  }
})
