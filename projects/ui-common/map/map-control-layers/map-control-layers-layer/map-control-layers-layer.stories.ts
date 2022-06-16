import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersLayerComponent } from './map-control-layers-layer.component'
import { TheSeamMapControlLayersLayerModule } from './map-control-layers-layer.module'

export default {
  title: 'Map/Controls/Layers/Layer',
  // component: TheSeamMapControlLayersLayerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersLayerModule
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
  template: `<seam-map-control-layers-layer label="Layer 1"></seam-map-control-layers-layer>`
})
