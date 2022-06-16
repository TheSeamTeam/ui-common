import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamGoogleMapsModule } from '@theseam/ui-common/google-maps'

import { TheSeamMapComponent } from './map.component'
import { TheSeamMapModule } from './map.module'

export default {
  title: 'Map/Components',
  component: TheSeamMapComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapModule,
        TheSeamGoogleMapsModule,
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '40px',
    }
  }
}

export const Basic = ({ ...args }) => ({
  template: `
    <seam-map>
      <seam-google-maps-wrapper></seam-google-maps-wrapper>
      <seam-map-controls-menu *seamMapControl [controls]="[ 'layers' ]"></seam-map-controls-menu>
    </seam-map>`
})
