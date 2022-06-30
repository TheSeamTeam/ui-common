import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import shp from 'shpjs'

import { TheSeamGoogleMapsWrapperComponent } from '../google-maps-wrapper/google-maps-wrapper.component'
import { TheSeamGoogleMapsModule } from '../google-maps.module'


// import geoData from '../../assets/charitygrove.json'
const geoData1$ = new Observable(subscriber => {
  fetch('assets/charitygrove.json')
    .then(response => response.json())
    .then(json => subscriber.next(json))

  // await (await fetch('assets/charitygrove.json')).json()
}).pipe(
  shareReplay({ bufferSize: 1, refCount: true })
)

const geoData2$ = new Observable(subscriber => {
  fetch('assets/1434.shp')
  // fetch('assets/TM_WORLD_BORDERS_SIMPL-0.3.shp')
  // fetch('assets/nj_counties.zip')
    .then(response => response.arrayBuffer())
    // .then(buf => shp(buf))
    .then(buf => shp.parseShp(buf, undefined as any))
    .then(x => {
      console.log('content before:', x)
      return {
        type: 'FeatureCollection',
        name: '1434',
        features: [
          {
            type: 'Feature',
            geometry: x[0]
          }
        ]
      }
    })
    .then(x => {
      console.log('content:', x)
      return x
    })
  // shp('http://localhost:6006/assets/TM_WORLD_BORDERS_SIMPL-0.3.zip')
  // shp('http://localhost:6006/assets/nj_counties.zip')
    .then((json: any) => subscriber.next(json))

  // await (await fetch('assets/charitygrove.json')).json()
}).pipe(
  shareReplay({ bufferSize: 1, refCount: true })
)

const geoData$ = geoData2$

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
