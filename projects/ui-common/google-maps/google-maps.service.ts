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
  getHoveredStyleOptionsDefinedByFeature,
  getPossibleExteriorFeature,
  getStyleOptionsDefinedByFeature,
  isFeatureSelected,
  polygonHasValidPathsLengths,
  removeAllFeatures,
  setFeatureSelected,
  stripAppFeaturePropertiesFromJson,
} from './google-maps-feature-helpers'
import { MapValueManagerService, MapValueSource } from './map-value-manager.service'

declare const ngDevMode: boolean | undefined

const DEFAULT_POLYGON_OPTIONS = (editingEnabled: boolean): google.maps.PolygonOptions => ({
  clickable: editingEnabled,
  draggable: editingEnabled,
  editable: editingEnabled,
})

const DEFAULT_DRAWING_MANAGER_OPTIONS = (editingEnabled: boolean): google.maps.drawing.DrawingManagerOptions => ({
  drawingControl: editingEnabled,
  drawingControlOptions: {
    drawingModes: [
      google.maps.drawing.OverlayType.POLYGON,
    ],
  },
  polygonOptions: DEFAULT_POLYGON_OPTIONS(editingEnabled),
  drawingMode: null,
})

const FEATURE_STYLE_OPTIONS_DEFAULT = (editingEnabled: boolean): google.maps.Data.StyleOptions => ({
  clickable: true,
  // clickable: editingEnabled,
  visible: true,
  // zIndex?: number;

  // cursor?: string;
  draggable: false,
  editable: false,
  fillColor: 'teal',
  fillOpacity: 0.3,
  strokeColor: 'blue',
  strokeOpacity: 1,
  strokeWeight: 2,
})

const FEATURE_STYLE_OPTIONS_SELECTED = (editingEnabled: boolean): google.maps.Data.StyleOptions => ({
  ...FEATURE_STYLE_OPTIONS_DEFAULT(editingEnabled),
  draggable: editingEnabled,
  editable: editingEnabled,
  fillColor: 'green',
  fillOpacity: 0.7,
  strokeColor: 'limegreen',
  strokeOpacity: 1,
  strokeWeight: 2,
})

const FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED = (editingEnabled: boolean): google.maps.Data.StyleOptions => ({
  strokeColor: 'black',
  strokeOpacity: 1,
  strokeWeight: 4,
})

const SUPPORTED_PROPERTY_STYLE_OPTIONS: (keyof google.maps.Data.StyleOptions)[] = [
  'fillColor',
  'fillOpacity',
  'strokeColor',
  'strokeOpacity',
  'strokeWeight',
  'label',
  'opacity',
  'icon',
  'clickable',
  'visible',
]

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

@Injectable()
export class GoogleMapsService implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  private readonly _mapReadySubject = new BehaviorSubject<boolean>(false)
  private readonly _editingEnabledSubject = new BehaviorSubject<boolean>(true)

  private _drawingManager?: google.maps.drawing.DrawingManager
  private _featureContextMenu: MenuComponent | null = null
  private _activeContextMenu: GoogleMapsContextMenu | null = null
  private _baseLatLng?: google.maps.LatLngLiteral
  private _padding?: number | google.maps.Padding

  private _allowDrawingHoleInPolygon = false

  // TODO: Move to a better place than the map wrapper service.
  private _fileInputHandler: ((file: File) => void) | undefined | null

  public googleMap?: google.maps.Map

  public readonly mapReady$: Observable<boolean>

  public get mapReady(): boolean { return this._mapReadySubject.value }

  public readonly editingEnabled$: Observable<boolean>

  constructor(
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _ngZone: NgZone,
    private readonly _vcr: ViewContainerRef,
  ) {
    this.editingEnabled$ = this._editingEnabledSubject.asObservable()
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

  public setBaseLatLng(lat: number, lng: number): void {
    this._baseLatLng = { lat, lng }
  }

  public setPadding(padding: number | google.maps.Padding | undefined): void {
    this._padding = padding
  }

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  public setFeatureContextMenu(menu: MenuComponent | null): void {
    this.closeContextMenu()
    this._featureContextMenu = menu
  }

  public setEditingEnabled(enabled: boolean): void {
    this._editingEnabledSubject.next(enabled)

    if (this.mapReady) {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      if (!enabled) {
        this.stopDrawing()
        const options = DEFAULT_DRAWING_MANAGER_OPTIONS(this.isEditingEnabled())
        this._drawingManager?.setOptions(options)
        this._drawingManager?.setMap(null)
        this.googleMap.data.forEach(f => {
          if (isFeatureSelected(f)) {
            setFeatureSelected(f, false)
          }
        })
      } else {
        const options = DEFAULT_DRAWING_MANAGER_OPTIONS(this.isEditingEnabled())
        this._drawingManager?.setOptions(options)
        this._drawingManager?.setMap(this.googleMap)
      }
    }
  }

  public isEditingEnabled(): boolean {
    return this._editingEnabledSubject.value
  }

  public getDiv(): HTMLDivElement {
    this._assertInitialized()
    return this.googleMap.getDiv() as HTMLDivElement
  }

  public fitBounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding): void {
    this._assertInitialized()
    this.googleMap.fitBounds(bounds, padding)
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
          event.overlay?.setMap(null)
          listener.remove()
        },
      )

      // To fake canceling the current drawing, without disabling the drawing
      // mode, the drawing mode is being unset then immediately set back. When
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

    const options = DEFAULT_DRAWING_MANAGER_OPTIONS(this.isEditingEnabled())

    const drawingManager = new google.maps.drawing.DrawingManager(options)
    drawingManager.setMap(this.googleMap)

    this._drawingManager = drawingManager

    this._drawingManager.addListener('drawingmode_changed', (event: any) => {
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
    this.googleMap.fitBounds(getBoundsWithAllFeatures(this.googleMap.data), this._padding)
  }

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  public reCenterOnFeatures(): void {
    this._assertInitialized()
    if (getFeaturesCount(this.googleMap.data) === 0) {
      if (!this._baseLatLng) {
        return
      }

      this.googleMap.panTo(this._baseLatLng)
      return
    }
    this.googleMap.fitBounds(getBoundsWithAllFeatures(this.googleMap.data), this._padding)

    // TODO: Fix to pan to center. Currently fitBounds results in the expected
    // result, but pantToBounds animates.
    // this.googleMap.panToBounds(getBoundsWithAllFeatures(this.googleMap.data))
  }

  public allowDrawingHoleInPolygon(allow: boolean): void {
    this._allowDrawingHoleInPolygon = allow
  }

  public setFileInputHandler(handler: ((file: File) => void) | undefined | null): void {
    this._fileInputHandler = handler
  }

  public getFileInputHandler(): ((file: File) => void) | undefined | null {
    return this._fileInputHandler
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
    this.googleMap.data.setStyle(feature => {
      let opts = FEATURE_STYLE_OPTIONS_DEFAULT(this.isEditingEnabled())

      const options = getStyleOptionsDefinedByFeature(feature)
      this._mergeStyleOptions(opts, options ?? {})

      if (isFeatureSelected(feature)) {
        const hoverOptions = getHoveredStyleOptionsDefinedByFeature(feature)
        opts = FEATURE_STYLE_OPTIONS_SELECTED(this.isEditingEnabled())
        this._mergeStyleOptions(opts, hoverOptions ?? {})
      }

      return opts
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
        this.setFeatureHoveredStyleOverride(event.feature)
      }
    })

    // Remove any hover styles when mouse moves away.
    this.googleMap.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
    })
  }

  public setFeatureHoveredStyleOverride(feature: google.maps.Data.Feature) {
    this._assertInitialized()
    const overrideOpts = FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED(this.isEditingEnabled())
    const hoverOptions = getHoveredStyleOptionsDefinedByFeature(feature)
    this._mergeStyleOptions(overrideOpts, hoverOptions ?? {})
    this.googleMap.data.overrideStyle(feature, overrideOpts)
  }

  private _mergeStyleOptions(options: google.maps.Data.StyleOptions, propertiesStyleOptions: google.maps.Data.StyleOptions): void {
    if (Object.keys(propertiesStyleOptions).length === 0) {
      return
    }

    for (const opt of SUPPORTED_PROPERTY_STYLE_OPTIONS) {
      if (Object.prototype.hasOwnProperty.call(propertiesStyleOptions, opt)) {
        options[opt] = propertiesStyleOptions[opt] as any
      }
    }
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

      this._openContextMenuForFeature(event.feature, event.latLng ?? undefined)
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

        // TODO: See if there is a way to prevent the polygon from completing
        // without enough points. This is very low priority, because starting
        // over after adding a single point isn't a major inconvenience.
        if (!polygonHasValidPathsLengths(polygon)) {
          // Remove the drawn polygon.
          polygon.setMap(null)
          // Stop drawing.
          this._drawingManager?.setDrawingMode(null)
          return
        }

        // Create a map feature of the drawn polygon.
        const feature = createDataFeatureFromPolygon(polygon)
        // Remove the drawn polygon.
        polygon.setMap(null)

        // Stop drawing.
        this._drawingManager?.setDrawingMode(null)

        // Check if the feature should be used as a cutout to an existing
        // feature or added as it's own feature.
        const exteriorPolygonFeature = this._allowDrawingHoleInPolygon
          ? getPossibleExteriorFeature(this.googleMap.data, feature)
          : undefined
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

  // TODO: Refactor out of the service meant to just wrap the google maps api.
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

  // TODO: Refactor out of the service meant to just wrap the google maps api.
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

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  public openContextMenu(): void {
    const feature = this.getSelectedFeature()
    if (feature) {
      this._openContextMenuForFeature(feature)
    }
  }

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  public closeContextMenu(): void {
    if (this._activeContextMenu) {
      this._activeContextMenu.close()
      this._activeContextMenu = null
    }
  }

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  private _openContextMenuForFeature(feature: google.maps.Data.Feature, position?: google.maps.LatLng) {
    this.closeContextMenu()

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
