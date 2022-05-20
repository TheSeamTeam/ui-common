import { InjectionToken } from '@angular/core'

export interface MapControlsService {
  addPolygonEditorControls(element: HTMLElement): void
  removePolygonEditorControls(): void
}

export const MAP_CONTROLS_SERVICE = new InjectionToken<MapControlsService>('MAP_CONTROLS_SERVICE')
