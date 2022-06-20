import { Injectable, NgZone, ViewContainerRef } from '@angular/core'

import { MapManagerService } from '@theseam/ui-common/map'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'
import booleanContains from '@turf/boolean-contains'
import {
  multiPolygon as turfjsMultiPolygon,
  polygon as turfjsPolygon,
} from '@turf/helpers'

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

const APP_FEATURE_PROPERTY_PREFIX = '__app__'

function getSeamFeaturePropertyName(name: string): string {
  return `${APP_FEATURE_PROPERTY_PREFIX}${name}`
}

function getSeamFeatureProperty(feature: google.maps.Data.Feature, name: string): any {
  return feature.getProperty(getSeamFeaturePropertyName(name))
}

function setSeamFeatureProperty(feature: google.maps.Data.Feature, name: string, value: any): void {
  feature.setProperty(getSeamFeaturePropertyName(name), value)
}

function isFeatureSelected(feature: google.maps.Data.Feature): boolean {
  const isSelected = getSeamFeatureProperty(feature, 'isSelected')
  if (typeof isSelected === 'boolean') {
    return isSelected
  }
  return false
}

function setFeatureSelected(feature: google.maps.Data.Feature, isSelected: boolean): void {
  setSeamFeatureProperty(feature, 'isSelected', isSelected)
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

    window.addEventListener('keypress', (event: KeyboardEvent) => {
      console.log('code', event.code)
    })

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      console.log('code', event.code)

      if (event.code === 'Delete') {
        this._assertInitialized()
        this.googleMap.data.forEach(f => {
          if (isFeatureSelected(f)) {
            this.googleMap?.data.remove(f)
          }
        })
      } else if (event.code === 'Escape') {
        if (this._drawingManager?.getDrawingMode() !== null) {
          this._drawingManager?.setDrawingMode(null)
        }
      }
    })
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

    this.googleMap.addListener('click', (even: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
      this._assertInitialized()
      console.log('%cMap click', 'color:cyan')
      this.googleMap.data.forEach(f => setFeatureSelected(f, false))
    })

    // Color each letter gray. Change the color when the isColorful property
    // is set to true.
    this.googleMap.data.setStyle((feature) => {
      // console.log('setStyle', feature)
      // let color = 'gray'
      // if (feature.getProperty('isColorful')) {
      //   color = feature.getProperty('color')
      // }

      if (isFeatureSelected(feature)) {
        return FEATURE_STYLE_OPTIONS_SELECTED
      }

      // return /** @type {!google.maps.Data.StyleOptions} */({
      //   fillColor: color,
      //   strokeColor: color,
      //   strokeWeight: 2
      // })
      return FEATURE_STYLE_OPTIONS_DEFAULT
    })

    // When the user clicks, set 'isColorful', changing the color of the letters.
    this.googleMap.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      console.log('click', event)
      // event.feature.setProperty('isColorful', true)
      console.log('type', event.feature.getGeometry().getType())

      this._assertInitialized()

      setFeatureSelected(event.feature, true)
      this.googleMap.data.forEach(f => {
        if (f !== event.feature && isFeatureSelected(f)) {
          setFeatureSelected(f, false)
        }
      })
    })

    // When the user hovers, tempt them to click by outlining the letters.
    // Call revertStyle() to remove all overrides. This will use the style rules
    // defined in the function passed to setStyle()
    this.googleMap.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      // console.log('mouseover', event)
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
        this.googleMap.data.overrideStyle(event.feature, { strokeWeight: 4 })
      }
    })

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

        this._assertInitialized()
        const arr = polygon.getPath().getArray()
        const feature = new google.maps.Data.Feature({
          geometry: new google.maps.Data.Polygon([ arr ])
        })
        this.googleMap.data.add(feature)
        setFeatureSelected(feature, true)

        polygon.setMap(null)

        this._drawingManager?.setDrawingMode(null)

        // this.googleMap.data.forEach(f => {
        //   if () {

        //   }
        // })

        let exteriorPolygonFeature: google.maps.Data.Feature | undefined
        this.googleMap.data.forEach(f => {
          if (f !== feature && (f.getGeometry().getType() === 'Polygon' && this.featureContains(f, feature))) {
            exteriorPolygonFeature = f
          }
        })
        console.log('found', exteriorPolygonFeature)
        if (exteriorPolygonFeature) {
          const featurePolygon = feature.getGeometry() as google.maps.Data.Polygon
          const exteriorPolygon = exteriorPolygonFeature.getGeometry() as google.maps.Data.Polygon
          exteriorPolygonFeature.setGeometry(new google.maps.Data.Polygon([
            ...exteriorPolygon.getArray(),
            featurePolygon.getAt(0).getArray().reverse()
          ]))

          this.googleMap.data.remove(feature)
          setFeatureSelected(exteriorPolygonFeature, true)
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

  public featureContains(featureA: google.maps.Data.Feature, featureB: google.maps.Data.Feature): boolean {
    // let aGeoJsonFeature: any
    // featureA.toGeoJson(f => aGeoJsonFeature = f)

    // let bGeoJsonFeature: any
    // featureB.toGeoJson(f => bGeoJsonFeature = f)

    const polygonCoordinates = (googlePolygon: google.maps.Data.Polygon): number[][][] => {
      return googlePolygon.getArray().map(linRing => {
        const coords = linRing.getArray().map(x => [ x.lng(), x.lat() ])
        // Google maps paths don't always start and stop at the exact same
        // position, so this will fix that for turfjs.
        if (coords.length > 1) {
          coords.push(coords[0])
        }
        return coords
      })
    }

    const multiPolygonCoordinates = (googleMultiPolygon: google.maps.Data.MultiPolygon): number[][][][] => {
      return googleMultiPolygon.getArray().map(x => polygonCoordinates(x))
    }

    const toTurfJsPolygon = (googlePolygon: google.maps.Data.Polygon) => {
      return turfjsPolygon(polygonCoordinates(googlePolygon))
    }

    const toTurfJsMultiPolygon = (googleMultiPolygon: google.maps.Data.MultiPolygon) => {
      return turfjsMultiPolygon(multiPolygonCoordinates(googleMultiPolygon))
    }

    const toTurfJsFeature = (googleFeature: google.maps.Data.Feature) => {
      if (googleFeature.getGeometry().getType() === 'Polygon') {
        return toTurfJsPolygon(googleFeature.getGeometry() as google.maps.Data.Polygon)
      } else if (googleFeature.getGeometry().getType() === 'MultiPolygon') {
        return toTurfJsMultiPolygon(googleFeature.getGeometry() as google.maps.Data.MultiPolygon)
      }

      throw Error(`Unexpected geometry.`)
    }

    const polygonA = toTurfJsFeature(featureA)
    const polygonB = toTurfJsFeature(featureB)

    console.log('polygonA', polygonA)
    console.log('polygonB', polygonB)
    return booleanContains(polygonA, polygonB)
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
