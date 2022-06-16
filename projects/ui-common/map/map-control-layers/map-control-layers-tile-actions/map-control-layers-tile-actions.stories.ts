import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersTileActionsComponent } from './map-control-layers-tile-actions.component'
import { TheSeamMapControlLayersTileActionsModule } from './map-control-layers-tile-actions.module'

export default {
  title: 'Map/Controls/Layers/TileActions',
  // component: TheSeamMapControlLayersTileActionsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersTileActionsModule
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
  template: `<seam-map-control-layers-tile-actions></seam-map-control-layers-tile-actions>`
})
