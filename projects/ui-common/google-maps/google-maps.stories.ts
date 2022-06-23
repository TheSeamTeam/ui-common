import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamGoogleMapsWrapperComponent } from './google-maps-wrapper/google-maps-wrapper.component'
import { TheSeamGoogleMapsModule } from './google-maps.module'

export default {
  title: 'GoogleMaps/Components',
  // component: TheSeamGoogleMapsWrapperComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamGoogleMapsModule,
      ]
    })
  ],
}

export const Basic = ({ ...args }) => ({
  template: `<seam-google-maps-wrapper seamHoverClass="border border-warning"></seam-google-maps-wrapper>`
})
