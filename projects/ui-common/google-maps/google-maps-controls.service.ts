import { Injectable, Self } from '@angular/core'

import { MapControlsService } from '@theseam/ui-common/map'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { GoogleMapsService } from './google-maps.service'

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
