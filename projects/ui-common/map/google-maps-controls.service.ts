import { Injectable, Self } from '@angular/core'

import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { GoogleMapsService } from './googlemaps.service'
import { MapControlsService } from './map-controls-service'

@Injectable()
export class GoogleMapsControlsService implements MapControlsService {

  constructor(
    private readonly _googleMaps: GoogleMapsService,
  ) { }

  public addPolygonEditorControls(element: HTMLElement): void {
    this._googleMaps.addPolygonEditorControls(element)
  }

  public removePolygonEditorControls(): void {
    throw Error(`Not implemented.`)
  }
}
