import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

import { MapManager } from './map-manager'

export enum MapControlKind {
  PolygonEditor = 'polygonEditor'
}

export type MapControlsActiveStatus = { [key in MapControlKind]: boolean }

// TODO: Change status to more descriptive status than boolean, if this way of
// tracking is kept. Such as, 'adding'. 'added', 'removing', 'removed', etc.
const DEFAULT_MAP_CONTROLS_ACTIVE_STATUS: MapControlsActiveStatus = {
  [MapControlKind.PolygonEditor]: true,
}

export interface MapControlsActiveStatusChanged {
  kind: MapControlKind
  active: boolean
}

@Injectable()
export class MapManagerService {

  // private _activeMapManager?: MapManager

  // private readonly _controlsStateSubject = new BehaviorSubject<MapControlsActiveStatus>(DEFAULT_MAP_CONTROLS_STATE)
  private readonly _mapReadySubject = new BehaviorSubject<boolean>(false)

  private readonly _controlsActiveStatusChangedSubject = new Subject<MapControlsActiveStatusChanged>()

  private readonly _controlsActiveStatus: MapControlsActiveStatus = DEFAULT_MAP_CONTROLS_ACTIVE_STATUS

  public readonly mapReady$: Observable<boolean>

  public readonly controlsStatusChanged: Observable<MapControlsActiveStatusChanged>

  public get mapReady(): boolean { return this._mapReadySubject.value }

  constructor() {
    this.mapReady$ = this._mapReadySubject.asObservable()
    this.controlsStatusChanged = this._controlsActiveStatusChangedSubject.asObservable()
  }

  public setMapReadyStatus(ready: boolean): void {
    this._mapReadySubject.next(ready)
  }

  public isControlActive(controlKind: MapControlKind): boolean {
    return this._controlsActiveStatus[controlKind]
  }

  public setControlActiveStatus(controlKind: MapControlKind, active: boolean): void {
    if (this.isControlActive(controlKind) === active) {
      return
    }

    this._controlsActiveStatus[controlKind] = active

    const changed: MapControlsActiveStatusChanged = {
      kind: controlKind,
      active,
    }

    this._controlsActiveStatusChangedSubject.next(changed)
  }

}
