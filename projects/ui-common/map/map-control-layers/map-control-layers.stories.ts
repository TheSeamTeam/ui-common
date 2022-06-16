import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersComponent } from './map-control-layers.component'
import { TheSeamMapControlLayersModule } from './map-control-layers.module'

export default {
  title: 'Map/Controls/Layers',
  // component: TheSeamMapControlLayersComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlLayersModule
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
  template: `<seam-map-control-layers></seam-map-control-layers>`
})
