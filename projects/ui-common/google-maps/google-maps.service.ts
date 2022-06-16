import { Injectable, ViewContainerRef } from '@angular/core'

import { MapManagerService } from '@theseam/ui-common/map'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

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

@Injectable()
export class GoogleMapsService {

  private _map?: google.maps.Map
  private _drawingManager?: google.maps.drawing.DrawingManager

  constructor(
    private readonly _mapManager: MapManagerService,
    private readonly _vcr: ViewContainerRef,
  ) { }

  public setMap(map: google.maps.Map): void {
    console.log('setMap', map)
    this._map = map
    this._mapManager.setMapReadyStatus(true)
    this._initDrawingManager()
  }

  private _initDrawingManager() {
    if (notNullOrUndefined(this._drawingManager)) {
      throw Error(`DrawingManager is already initialized.`)
    }

    const map = this._map
    if (isNullOrUndefined(map)) {
      throw Error(`Map must be ready before initializing the drawing manager.`)
    }

    const options = DEFAULT_DRAWING_MANAGER_OPTIONS()

    const drawingManager = new google.maps.drawing.DrawingManager(options)
    drawingManager.setMap(map)

    this._drawingManager = drawingManager
  }

  public addPolygonEditorControls(element: HTMLElement): void {
    console.log('addPolygonEditorControls', element)
    const map = this._map
    if (isNullOrUndefined(map)) {
      throw Error(`Map must be ready before adding polygon editor controls.`)
    }

    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(element)
  }



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
