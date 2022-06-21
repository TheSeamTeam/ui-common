import { Injectable, NgZone, ViewContainerRef } from '@angular/core'

import { MapManagerService } from '@theseam/ui-common/map'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'
import {
  addInnerFeatureCutoutToExteriorFeature,
  createDataFeatureFromPolygon,
  getPossibleExteriorFeature,
  isFeatureSelected,
  setFeatureSelected,
} from './google-maps-feature-helpers'

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

const FEATURE_STYLE_OPTIONS_DEFAULT: google.maps.Data.StyleOptions = {
  clickable: true,
  visible: true,
  // zIndex?: number;

  // cursor?: string;
  draggable: false,
  editable: false,
  fillColor: 'gray',
  fillOpacity: 0.3,
  strokeColor: 'gray',
  strokeOpacity: 1,
  strokeWeight: 2,
}

const FEATURE_STYLE_OPTIONS_SELECTED: google.maps.Data.StyleOptions = {
  ...FEATURE_STYLE_OPTIONS_DEFAULT,
  draggable: true,
  editable: true,
  fillColor: 'green',
  fillOpacity: 0.7,
  strokeColor: 'limegreen',
  strokeOpacity: 1,
  strokeWeight: 2,
}

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

  /**
   * Iterates the map's features and removes any that are selected.
   */
  public deleteSelection(): void {
    this._assertInitialized()
    const mapData = this.googleMap.data
    mapData.forEach(f => {
      if (isFeatureSelected(f)) {
        mapData.remove(f)
      }
    })
  }

  /**
   * Stops the current drawing.
   */
  public stopDrawing(): void {
    this._ngZone.runOutsideAngular(() => {
      if (isNullOrUndefined(this._drawingManager) || this._drawingManager.getDrawingMode() === null) {
        return
      }

      // Listening for the completion event of the overlay currently being drawn
      // and removing it. I haven't found a way to cancel the current drawing,
      // without this hack that assumes our listeners will not run into a race
      // condition.
      const listener = google.maps.event.addListener(
        this._drawingManager,
        'overlaycomplete',
        (event: google.maps.drawing.OverlayCompleteEvent) => {
          event.overlay.setMap(null)
          listener.remove()
        }
      )

      // To fake canceling the current drawing, without disabling the drawing
      // mode, the drawin mode is being unset then immediately set back. When
      // the mode is unset the 'overlaycomplete' event will fire, which will
      // give a reference to the current overlay to remove, then it is set back
      // to the mode the user was using. To the user is should just seem like
      // the current drawing was canceled and they can start drawing again.
      const mode = this._drawingManager.getDrawingMode()
      this._drawingManager.setDrawingMode(null)
      this._drawingManager.setDrawingMode(mode)

      // 'overlaycomplete' should fire immediately, unless an overlay hadn't
      // started drawing. This timeout will make sure the listener gets removed.
      setTimeout(() => {
        listener.remove()
      })

    })
  }

  private _initDrawingManager(): void {
    if (notNullOrUndefined(this._drawingManager)) {
      throw Error(`DrawingManager is already initialized.`)
    }

    this._assertInitialized()

    const options = DEFAULT_DRAWING_MANAGER_OPTIONS()

    const drawingManager = new google.maps.drawing.DrawingManager(options)
    drawingManager.setMap(this.googleMap)

    this._drawingManager = drawingManager

    this._drawingManager.addListener('drawingmode_changed', event => {
      // console.log('drawingmode change', event, this._drawingManager?.getDrawingMode())
      if (this._drawingManager?.getDrawingMode() !== null) {
        this._assertInitialized()
        this.googleMap.data.forEach(f => {
          if (isFeatureSelected(f)) {
            setFeatureSelected(f, false)
          }
        })
      }
    })
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

    // Disable any selection when clicking the map.
    //
    // TODO: There may be a better way to do this that would be more accurate or
    // additional events that should be listened to, such as the disabling
    // selection when the map looses focus.
    this.googleMap.addListener('click', (even: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
      this._assertInitialized()
      // console.log('%cMap click', 'color:cyan')
      this.googleMap.data.forEach(f => setFeatureSelected(f, false))
    })

    // Determine what the style of the features are.
    this.googleMap.data.setStyle((feature) => {
      if (isFeatureSelected(feature)) {
        return FEATURE_STYLE_OPTIONS_SELECTED
      }

      return FEATURE_STYLE_OPTIONS_DEFAULT
    })

    // Select a feature when clicked.
    this.googleMap.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      // console.log('click', event)
      // console.log('type', event.feature.getGeometry().getType())

      this._assertInitialized()

      setFeatureSelected(event.feature, true)
      this.googleMap.data.forEach(f => {
        if (f !== event.feature && isFeatureSelected(f)) {
          setFeatureSelected(f, false)
        }
      })
    })

    // Set a style on hovered features that can be selected.
    this.googleMap.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      // console.log('mouseover', event)
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
        this.googleMap.data.overrideStyle(event.feature, { strokeWeight: 4 })
      }
    })

    // Remove any hover styles when mouse moves away.
    this.googleMap.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      // console.log('mouseout', event)
      this._assertInitialized()
      this.googleMap.data.revertStyle()
    })
  }

  private _initFeatureChangeListeners(): void {
    this._assertInitialized()

    this.googleMap.data.addListener('addfeature', (event: google.maps.Data.AddFeatureEvent) => {
      console.log('%cadded feature', 'color:limegreen', event.feature)
    })

    this.googleMap.data.addListener('removefeature', (event: google.maps.Data.RemoveFeatureEvent) => {
      console.log('%cremoved feature', 'color:limegreen', event.feature)
    })

    if (notNullOrUndefined(this._drawingManager)) {
      // google.maps.event.addListener(this._drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
      google.maps.event.addListener(this._drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        console.log('%cpolygon complete', 'color:limegreen', polygon)

        // The DrawingManager doesn't seem to have a way to access the overlays,
        // so if the map is not set then it shouldn'y be considered a successful
        // completion. I am canceling the active drawing by disabling drawing
        // mode and setting the map null in the 'overlaycomplete' event, which
        // fires before the 'polygoncomplete' event.
        if (isNullOrUndefined(polygon.getMap())) {
          return
        }

        this._assertInitialized()

        // Create a map feature of the drawn polygon.
        const feature = createDataFeatureFromPolygon(polygon)
        // Remove the drawn polygon.
        polygon.setMap(null)

        // Stop drawing.
        this._drawingManager?.setDrawingMode(null)

        // Check if the feature should be used as a cutout to an existing
        // feature or added as it's own feature.
        const exteriorPolygonFeature = getPossibleExteriorFeature(this.googleMap.data, feature)
        if (exteriorPolygonFeature) {
          addInnerFeatureCutoutToExteriorFeature(exteriorPolygonFeature, feature)
          setFeatureSelected(exteriorPolygonFeature, true)
        } else {
          this.googleMap.data.add(feature)
          setFeatureSelected(feature, true)
        }

        this.googleMap.data.toGeoJson(f => console.log('geoJson', f))
      })
    }
  }

  public isDrawing(): boolean {
    if (isNullOrUndefined(this._drawingManager)) {
      return true
    }

    return this._drawingManager.getDrawingMode() !== null
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
