import { InjectionToken } from '@angular/core'

import { ComponentType } from '@theseam/ui-common/models'

export interface MapControl<TData = any> {
  component: ComponentType<any>
  data?: TData
  position?: google.maps.ControlPosition
}

export interface MapControlsService {
  add(control: MapControl): void
}

export const MAP_CONTROLS_SERVICE = new InjectionToken<MapControlsService>('MAP_CONTROLS_SERVICE')

export const MAP_CONTROL_DATA = new InjectionToken<any>('MAP_CONTROL_DATA')
