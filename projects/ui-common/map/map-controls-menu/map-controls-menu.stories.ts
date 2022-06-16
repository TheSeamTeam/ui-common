import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamMapControlLayersModule } from '../map-control-layers/map-control-layers.module'
import { TheSeamMapControlsMenuComponent } from './map-controls-menu.component'
import { TheSeamMapControlsMenuModule } from './map-controls-menu.module'

export default {
  title: 'Map/ControlsMenu/Components',
  // component: TheSeamMapControlsMenuComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamMapControlsMenuModule,
        TheSeamMapControlLayersModule,
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
    <seam-map-controls-menu [controls]="[ 'layers' ]"></seam-map-controls-menu>
  `
})
