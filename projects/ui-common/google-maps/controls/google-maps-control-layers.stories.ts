import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { TheSeamGoogleMapsWrapperComponent } from '../google-maps-wrapper/google-maps-wrapper.component'
import { TheSeamGoogleMapsModule } from '../google-maps.module'


// import geoData from '../../assets/charitygrove.json'
const geoData$ = new Observable(subscriber => {
  console.log('test')
  fetch('assets/charitygrove.json')
    .then(response => response.json())
    .then(json => subscriber.next(json))

  // await (await fetch('assets/charitygrove.json')).json()
}).pipe(
  shareReplay({ bufferSize: 1, refCount: true })
)

export default {
  title: 'GoogleMaps/Controls/Layers',
  // component: TheSeamGoogleMapsWrapperComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamGoogleMapsModule
      ]
    })
  ],
  parameters: { }
}

export const Basic = ({ ...args }) => ({
  template: `<seam-google-maps-wrapper [value]="geoData$ | async"></seam-google-maps-wrapper>`,
  props: {
    geoData$: geoData$
  }
})

export const Control = ({ ...args }) => ({
  template: `
  <input type="text" />
  <seam-google-maps-wrapper [value]="geoData$ | async"></seam-google-maps-wrapper>
  <input type="text" />`,
  props: {
    geoData$: geoData$
  }
})
