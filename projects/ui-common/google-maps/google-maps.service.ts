import { Injectable, NgZone, OnDestroy, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, from, Observable, Subject } from 'rxjs'
import { switchMap, takeUntil, tap } from 'rxjs/operators'

import { MenuComponent } from '@theseam/ui-common/menu'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { GoogleMapsContextMenu } from './google-maps-contextmenu'
import {
  addInnerFeatureCutoutToExteriorFeature,
  createDataFeatureFromPolygon,
  createFeatureChangeObservable,
  getBoundsWithAllFeatures,
  getFeatureCenter,
  getFeaturesCount,
  getPossibleExteriorFeature,
  isFeatureSelected,
  removeAllFeatures,
  setFeatureSelected,
  stripAppFeaturePropertiesFromJson,
} from './google-maps-feature-helpers'
import { MapValueManagerService, MapValueSource } from './map-value-manager.service'

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
export class GoogleMapsService implements OnDestroy {
  private readonly _ngUnsubscribe = new Subject<void>()

  private readonly _mapReadySubject = new BehaviorSubject<boolean>(false)

  private _drawingManager?: google.maps.drawing.DrawingManager
  private _featureContextMenu: MenuComponent | null = null
  private _activeContextMenu: GoogleMapsContextMenu | null = null

  public googleMap?: google.maps.Map

  public readonly mapReady$: Observable<boolean>

  public get mapReady(): boolean { return this._mapReadySubject.value }

  constructor(
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _ngZone: NgZone,
    private readonly _vcr: ViewContainerRef,
  ) {
    this.mapReady$ = this._mapReadySubject.asObservable()
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  public setMap(map: google.maps.Map): void {
    this.googleMap = map
    this._mapReadySubject.next(true)
    this._initDrawingManager()
    this._initFeatureStyling()
    this._initFeatureChangeListeners()
  }

  public setFeatureContextMenu(menu: MenuComponent | null): void {
    this._featureContextMenu = menu
  }

  public getDiv(): HTMLDivElement {
    this._assertInitialized()
    return this.googleMap.getDiv() as HTMLDivElement
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

  public addControl(element: HTMLElement, position: google.maps.ControlPosition): void {
    this._assertInitialized()
    this.googleMap.controls[position].push(element)
  }

  public async setData(data: any): Promise<void> {
    this._assertInitialized()
    removeAllFeatures(this.googleMap.data)
    this.googleMap.data.addGeoJson(data)
    this.googleMap.fitBounds(getBoundsWithAllFeatures(this.googleMap.data))
  }

  public reCenterOnFeatures(): void {
    this._assertInitialized()
    if (getFeaturesCount(this.googleMap.data) === 0) {
      return
    }
    this.googleMap.fitBounds(getBoundsWithAllFeatures(this.googleMap.data))
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
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
        this.googleMap.data.overrideStyle(event.feature, { strokeWeight: 4 })
      }
    })

    // Remove any hover styles when mouse moves away.
    this.googleMap.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
    })
  }

  private _initFeatureChangeListeners(): void {
    this._assertInitialized()

    createFeatureChangeObservable(this.googleMap.data, this._ngZone).pipe(
      switchMap(() => from(this.getGeoJson()).pipe(
        tap(geoJson => this._mapValueManager.setValue(geoJson, MapValueSource.FeatureChange)),
      )),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this.googleMap.data.addListener('contextmenu', (event: google.maps.Data.MouseEvent) => {
      if (!isFeatureSelected(event.feature)) {
        return
      }

      this._openContextMenuForFeature(event.feature, event.latLng)
    })

    if (notNullOrUndefined(this._drawingManager)) {
      google.maps.event.addListener(this._drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
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
      })
    }
  }

  public isDrawing(): boolean {
    if (isNullOrUndefined(this._drawingManager)) {
      return true
    }

    return this._drawingManager.getDrawingMode() !== null
  }

  public hasSelectedFeature(): boolean {
    this._assertInitialized()
    let isSelected = false
    this.googleMap.data.forEach(f => {
      if (isFeatureSelected(f)) {
        isSelected = true
      }
    })
    return isSelected
  }

  public getSelectedFeature(): google.maps.Data.Feature | null {
    this._assertInitialized()
    let feature: google.maps.Data.Feature | null = null
    this.googleMap.data.forEach(f => {
      if (isFeatureSelected(f)) {
        feature = f
      }
    })
    return feature
  }

  public openContextMenu(): void {
    const feature = this.getSelectedFeature()
    if (feature) {
      this._openContextMenuForFeature(feature)
    }
  }

  private _openContextMenuForFeature(feature: google.maps.Data.Feature, position?: google.maps.LatLng) {
    if (this._activeContextMenu) {
      this._activeContextMenu.close()
      this._activeContextMenu = null
    }

    this._assertInitialized()

    let _position = position
    if (!_position) {
      _position = getFeatureCenter(feature)
    }
    if (this._featureContextMenu) {
      this._activeContextMenu = new GoogleMapsContextMenu(
        this.googleMap,
        this._featureContextMenu,
        _position,
        this._vcr,
        this._ngZone,
        this.googleMap.data,
        feature,
      )
    }
  }

  public getGeoJson(removeAppProperties: boolean = true): Promise<object> {
    return new Promise((resolve, reject) => {
      this._assertInitialized()
      this.googleMap.data.toGeoJson(f => {
        if (removeAppProperties) {
          stripAppFeaturePropertiesFromJson(f)
        }
        resolve(f)
      })
    })
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
}
