import { ComponentRef, InjectionToken } from '@angular/core'

export interface MapControl<TData = any> {
  control: 'button' | ComponentRef<any> | HTMLElement
  data?: TData
}

export interface MapControlsService {
  addPolygonEditorControls(element: HTMLElement): void
  removePolygonEditorControls(): void

  add(control: MapControl): void
  remove(control: MapControl): void
}

export const MAP_CONTROLS_SERVICE = new InjectionToken<MapControlsService>('MAP_CONTROLS_SERVICE')

export const MAP_CONTROL_DATA = new InjectionToken<any>('MAP_CONTROL_DATA')
