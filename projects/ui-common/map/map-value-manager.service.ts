import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

import { MapManagerService } from './map-manager.service'

export interface MapValue {
  geoJson: any
  acres: number
}

export interface MapValueChanged {
  value: MapValue
}

@Injectable()
export class MapValueManagerService {

  // private readonly _valueChangedSubject = new Subject<MapValueChanged>()

  private _value: any

  // public readonly value$: Observable<boolean>

  public readonly valueChanged: Observable<MapValueChanged>

  constructor(
    private readonly _mapManager: MapManagerService
  ) {
    // this.value$ = this._mapManager.mapReady$

    // this.valueChanged = this._valueChangedSubject.asObservable()
    this.valueChanged = this._createValueChangedObservable()
  }

  // private _createValueObservable(): Observable<MapValue | null> {

  // }

  private _createValueChangedObservable(): Observable<MapValueChanged> {

  }

}
