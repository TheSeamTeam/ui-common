import { OnInit } from '@angular/core'
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
} from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'
import { GoogleMapsControlsService, MapControlRef } from './google-maps-controls.service'
import { GoogleMapsService } from './google-maps.service'

import { MapControl, MAP_CONTROLS_SERVICE } from './map-controls-service'

@Component({
  selector: 'seam-map-control',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapsControlComponent implements OnInit, OnDestroy {
  private readonly _ngUnsubscribe = new Subject<void>()

  private _controlRef?: MapControlRef

  @Input()
  set def(value: MapControl | null | undefined) {
    if (value !== this._def) {
      this._remove()
      this._def = value
    }
  }
  _def: MapControl | null | undefined

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
  ) { }

  /** @ignore */
  ngOnInit(): void {
    this._googleMaps.mapReady$.pipe(
      tap(ready => {
        if (ready) {
          this._add()
        } else {
          this._remove()
        }
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  /** @ignore */
  ngOnDestroy(): void {
    this._remove()

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _add(): void {
    if (this._controlRef) {
      return
    }

    if (this._def === null || this._def === undefined) {
      return
    }

    this._controlRef = this._googleMapsControls.add(this._def)
  }

  private _remove(): void {
    this._controlRef?.destroy()
    this._controlRef = undefined
  }
}
