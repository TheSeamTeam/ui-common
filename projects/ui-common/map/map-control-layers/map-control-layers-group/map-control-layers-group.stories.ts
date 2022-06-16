import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersLayerModule } from '../map-control-layers-layer/map-control-layers-layer.module'
import { TheSeamMapControlLayersGroupComponent } from './map-control-layers-group.component'
import { TheSeamMapControlLayersGroupModule } from './map-control-layers-group.module'

export default {
  title: 'Map/Controls/Layers/Group',
  // component: TheSeamMapControlLayersGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersGroupModule,
        TheSeamMapControlLayersLayerModule,
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
    <seam-map-control-layers-group>
      <seam-map-control-layers-layer label="Layer 1"></seam-map-control-layers-layer>
      <seam-map-control-layers-layer label="Layer 2"></seam-map-control-layers-layer>
    </seam-map-control-layers-group>
  `
})
