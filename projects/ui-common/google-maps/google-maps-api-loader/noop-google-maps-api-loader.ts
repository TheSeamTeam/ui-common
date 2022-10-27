import { Injectable } from '@angular/core'
import { defer, Observable, of, throwError } from 'rxjs'

import { TheSeamGoogleMapsApiLoader } from './google-maps-api-loader'

/**
 * When using the TheSeamNoopGoogleMapsAPILoader, the Google Maps API must be
 * added to the page some other way before the map component is initialixed. One
 * way would be via a `<script>` Tag.
 */
@Injectable()
export class TheSeamNoopGoogleMapsAPILoader extends TheSeamGoogleMapsApiLoader {
  load(): Observable<void> {
    return defer(() => {
      if (!(window as any).google || !(window as any).google.maps) {
        return throwError(new Error(
          'Google Maps API not loaded on page. Make sure window.google.maps is available.'
        ))
      }
      return of(undefined)
    })
  }
}
