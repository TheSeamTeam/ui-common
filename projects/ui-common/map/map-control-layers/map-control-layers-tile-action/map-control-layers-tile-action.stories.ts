import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersTileActionComponent } from './map-control-layers-tile-action.component'
import { TheSeamMapControlLayersTileActionModule } from './map-control-layers-tile-action.module'

export default {
  title: 'Map/Controls/Layers/TileAction',
  // component: TheSeamMapControlLayersTileActionComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersTileActionModule
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
  template: `<seam-map-control-layers-tile-action></seam-map-control-layers-tile-action>`
})
