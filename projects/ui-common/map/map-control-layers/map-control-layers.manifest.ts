import { Provider } from '@angular/core'

import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'

import { TheSeamMapControlMenuControlManifest, THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST } from '../map-controls-menu/map-controls-menu-control'
import { TheSeamMapControlLayersComponent } from './map-control-layers.component'

export const manifest: TheSeamMapControlMenuControlManifest = {
  component: TheSeamMapControlLayersComponent,
  name: 'layers',
  icon: faLayerGroup,
  label: 'Layers',
}

export const manifestProvider: Provider = {
  provide: THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST,
  useValue: manifest,
  multi: true,
}
