import { Injectable, NgZone, ViewContainerRef } from '@angular/core'

import { MapManagerService } from '@theseam/ui-common/map'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

declare const ngDevMode: boolean | undefined

const DEFAULT_POLYGON_OPTIONS: google.maps.PolygonOptions = {
  clickable: true,
  draggable: true,
  editable: true,
  // fillColor: 'rgba(60,150,60,1)',
  // strokeColor: 'rgba(155,255,0,1)'
}

const DEFAULT_DRAWING_MANAGER_OPTIONS: (() => google.maps.drawing.DrawingManagerOptions) = () => ({
  drawingControl: true,
  drawingControlOptions: {
    drawingModes: [
      google.maps.drawing.OverlayType.POLYGON
    ]
  },
  polygonOptions: DEFAULT_POLYGON_OPTIONS,
  drawingMode: null
})

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

@Injectable()
export class GoogleMapsService {

  private _drawingManager?: google.maps.drawing.DrawingManager

  public googleMap?: google.maps.Map

  constructor(
    private readonly _mapManager: MapManagerService,
    private readonly _ngZone: NgZone,
    private readonly _vcr: ViewContainerRef,
  ) { }

  public setMap(map: google.maps.Map): void {
    console.log('setMap', map)
    this.googleMap = map
    this._mapManager.setMapReadyStatus(true)
    this._initDrawingManager()
    this._initFeatureStyling()
    this._initFeatureChangeListeners()
  }

  private _initDrawingManager() {
    if (notNullOrUndefined(this._drawingManager)) {
      throw Error(`DrawingManager is already initialized.`)
    }

    this._assertInitialized()

    const options = DEFAULT_DRAWING_MANAGER_OPTIONS()

    const drawingManager = new google.maps.drawing.DrawingManager(options)
    drawingManager.setMap(this.googleMap)

    this._drawingManager = drawingManager
  }

  public addPolygonEditorControls(element: HTMLElement): void {
    this._assertInitialized()
    console.log('addPolygonEditorControls', element)
    this.googleMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(element)
  }

  public async setData(data: any): Promise<void> {
    this._assertInitialized()
    console.log('setData', data)
    this.googleMap.data.addGeoJson(data)
    this.googleMap.fitBounds(this._getBoundWithAllFeatures())
  }

  private _getBoundWithAllFeatures(): google.maps.LatLngBounds {
    this._assertInitialized()

    const bounds = new google.maps.LatLngBounds()

    this.googleMap.data.forEach(feature => {
      const geometry = feature.getGeometry()
      geometry.forEachLatLng(latLng => {
        bounds.extend(latLng)
      })
    })

    return bounds
  }

  private _initFeatureStyling(): void {
    this._assertInitialized()

    // Color each letter gray. Change the color when the isColorful property
    // is set to true.
    this.googleMap.data.setStyle((feature) => {
      console.log('setStyle', feature)
      let color = 'gray'
      if (feature.getProperty('isColorful')) {
        color = feature.getProperty('color')
      }
      return /** @type {!google.maps.Data.StyleOptions} */({
        fillColor: color,
        strokeColor: color,
        strokeWeight: 2
      })
    })

    // When the user clicks, set 'isColorful', changing the color of the letters.
    this.googleMap.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      console.log('click', event)
      event.feature.setProperty('isColorful', true)
      console.log('type', event.feature.getGeometry().getType())
    })

    // When the user hovers, tempt them to click by outlining the letters.
    // Call revertStyle() to remove all overrides. This will use the style rules
    // defined in the function passed to setStyle()
    this.googleMap.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      console.log('mouseover', event)
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      this.googleMap.data.overrideStyle(event.feature, {strokeWeight: 8})
    })

    this.googleMap.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      console.log('mouseout', event)
      this._assertInitialized()
      this.googleMap.data.revertStyle()
    })
  }

  private _initFeatureChangeListeners(): void {
    this._assertInitialized()

    this.googleMap.data.addListener('addfeature', (event: google.maps.Data.AddFeatureEvent) => {
      console.log('added feature', event.feature)
    })

    this.googleMap.data.addListener('removefeature', (event: google.maps.Data.RemoveFeatureEvent) => {
      console.log('removed feature', event.feature)
    })

    if (notNullOrUndefined(this._drawingManager)) {
      google.maps.event.addListener(this._drawingManager, 'overlaycomplete', (polygon: google.maps.drawing.OverlayCompleteEvent) => {
      // google.maps.event.addListener(this._drawingManager, 'polygoncomplete', (polygon: google.maps.drawing.OverlayCompletePolygonEvent) => {
        console.log('polygon complete', polygon)

        this._assertInitialized()
        // polygon.overlay.
        // console.log(this.googleMap.data.toGeoJson())
        const arr = (polygon.overlay as google.maps.Polygon).getPath().getArray()
        this.googleMap.data.add(new google.maps.Data.Feature({
          geometry: new google.maps.Data.Polygon([ arr ])
          // geometry: polygon.overlay
        }))

        this.googleMap.data.forEach(f => {
          // if (f === polygon.overlay) {
          //   console.log('found')
          // }
          console.log('f', f)
        })
      })
    }
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is WithRequired<GoogleMapsService, 'googleMap'> {
    if (!this.googleMap && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(
        'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      )
    }
  }




  // private async getFeature(map: google.maps.Map): Promise<google.maps.Data.Feature> {
  //   return new Promise((resolve, reject) => {
  //     map.data.toGeoJson(feat => {
  //       // feature = feat as google.maps.Data.Feature
  //       console.log('feat', feat)
  //       resolve(feat as google.maps.Data.Feature)
  //     })
  //   })
  // }

  // private async loadJson(url: string, map: google.maps.Map): Promise<google.maps.Data.Feature[]> {
  //   return new Promise((resolve, reject) => {
  //     map.data.loadGeoJson(url, undefined, (feats: google.maps.Data.Feature[] | FeatureCollection) => {
  //       // feature = feat as google.maps.Data.Feature
  //       console.log('feats', feats)
  //       if (!Array.isArray(feats) && feats.type === 'FeatureCollection') {
  //         resolve(feats.features)
  //       } else if (Array.isArray(feats)) {
  //         resolve(feats)
  //       } else {
  //         reject('Unexpected JSON.')
  //       }
  //     })
  //   })
  // }



  // this._polygon = this._createPolygon()
  // this._setPolygonChangeListener(this._polygon)

  // this.autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, {
  //   componentRestrictions: { country: 'US' }
  // })

  // this.autocomplete.addListener('place_changed', () => {
  //   if (typeof this.value === 'string' && this.value.length > 0) {
  //     return
  //   }

  //   this._ngZone.run( () => {
  //     const place = this.autocomplete.getPlace()
  //     if  (place.geometry !== undefined || place.geometry != null) {
  //       this.map.fitBounds(place.geometry.viewport)
  //     }
  //   })
  // })












  // this._centerPolygon()
  // this._updatePolygonPath()

  // if (this._polygon && !this.disabled && this._polygon.getPath().getLength() === 0) {
  //   this.drawingManager.setOptions({
  //     drawingMode: google.maps.drawing.OverlayType.POLYGON
  //   })
  // }

  // this.defaultRegion$.subscribe(data => {
  //   if (!this.value || this.value.length === 0) {
  //     this.map.setCenter({ lat: Number(data.latitude), lng: Number(data.longitude) })
  //   }
  //   this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.clearBtn.nativeElement)

  //   if (this._overlayCompleteListener) {
  //     google.maps.event.removeListener(this._overlayCompleteListener)
  //     this._overlayCompleteListener = undefined
  //   }

  //   this._overlayCompleteListener = google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
  //     if (event.type === google.maps.drawing.OverlayType.POLYGON) {
  //       if (this._polygon) {
  //         this._polygon.setMap(null)
  //         this._setPolygonChangeListener(this._polygon)
  //       }
  //       this._polygon = event.overlay
  //       this.drawingManager.setOptions({ drawingMode: null })

  //       this.value = event.overlay.getPath().getArray().toString()
  //     }
  //   })

  //   this.agmMap.triggerResize(true)
  // })
}
