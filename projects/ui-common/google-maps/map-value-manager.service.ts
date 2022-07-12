import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

export enum MapValueSource {
  Input = 'input',
  FeatureChange = 'featurechange'
}

export type MapValue = object | undefined | null

export interface MapValueChange {
  value: MapValue
  source: MapValueSource
}

@Injectable()
export class MapValueManagerService {

  private readonly _valueChangedSubject = new Subject<MapValueChange>()

  private _value: MapValue

  public readonly valueChanged: Observable<MapValueChange>

  constructor() {
    this.valueChanged = this._valueChangedSubject.asObservable()
  }

  public setValue(value: MapValue, source: MapValueSource): boolean {
    if (value === this._value) {
      return false
    }

    if (value === null || value === undefined) {
      this._value = value
      const _change: MapValueChange = {
        source,
        value: this._value,
      }
      this._valueChangedSubject.next(_change)
      return true
    }

    if (JSON.stringify(value) === JSON.stringify(this._value)) {
      return true
    }

    // TODO: Validate object is valid geojson.
    this._value = value
    const change: MapValueChange = {
      source,
      value: this._value,
    }
    this._valueChangedSubject.next(change)
    return true
  }

  public get value(): MapValue {
    return this._value
  }

}
