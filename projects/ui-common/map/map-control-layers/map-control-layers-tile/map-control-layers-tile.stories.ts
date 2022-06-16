import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersTileComponent } from './map-control-layers-tile.component'
import { TheSeamMapControlLayersTileModule } from './map-control-layers-tile.module'

export default {
  title: 'Map/Controls/Layers/Tile',
  // component: TheSeamMapControlLayersTileComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersTileModule
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
  template: `<seam-map-control-layers-tile></seam-map-control-layers-tile>`
})
