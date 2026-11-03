import { InjectionToken } from '@angular/core'

import { ComponentType } from '@theseam/ui-common/models'

export interface MapControl<TData = any> {
  component: ComponentType<any>
  data?: TData
  position?: google.maps.ControlPosition
  /**
   * Where the control sits among the others in its `position`, lowest first.
   * It is set as the element's `index`, which Google lays out by: a negative
   * order puts the control ahead of Google's own controls, such as the map
   * type and fullscreen buttons, and any other order after them.
   *
   * Give each control in a position a different order; Google may draw
   * controls with the same one in either order. A control without one is
   * appended after the ordered ones, in the order it was added.
   */
  order?: number
}

export interface MapControlsService {
  add(control: MapControl): void
}

export const MAP_CONTROLS_SERVICE = new InjectionToken<MapControlsService>(
  'MAP_CONTROLS_SERVICE',
)

export const MAP_CONTROL_DATA = new InjectionToken<any>('MAP_CONTROL_DATA')
