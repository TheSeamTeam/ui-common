import { Injectable, NgZone, OnDestroy, ViewContainerRef } from '@angular/core'
import { Geometry, Polygon } from 'geojson'
import { BehaviorSubject, from, Observable, Subject } from 'rxjs'
import { switchMap, takeUntil, tap } from 'rxjs/operators'

import { TerraDraw, TerraDrawPolyLineMode } from 'terra-draw'
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter'

import { MenuComponent } from '@theseam/ui-common/menu'
import {
  addHoleToPolygon,
  closePolygons,
  notNullOrUndefined,
  polygonContains,
  polygonHasMinDistinctVertices,
} from '@theseam/ui-common/utils'

import { GoogleMapsContextMenu } from './google-maps-contextmenu'
import {
  createFeatureChangeObservable,
  dataPolygonFromGeoJson,
  geoJsonPolygonFromDataFeature,
  getBoundsWithAllFeatures,
  getFeatureCenter,
  getFeaturesCount,
  getHoveredStyleOptionsDefinedByFeature,
  getStyleOptionsDefinedByFeature,
  isFeatureSelected,
  removeAllFeatures,
  setFeatureSelected,
  stripAppFeaturePropertiesFromJson,
} from './google-maps-feature-helpers'
import {
  MapValueManagerService,
  MapValueSource,
} from './map-value-manager.service'

declare const ngDevMode: boolean | undefined

const FEATURE_STYLE_OPTIONS_DEFAULT = (
  editingEnabled: boolean,
): google.maps.Data.StyleOptions => ({
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

const FEATURE_STYLE_OPTIONS_SELECTED = (
  editingEnabled: boolean,
): google.maps.Data.StyleOptions => ({
  ...FEATURE_STYLE_OPTIONS_DEFAULT(editingEnabled),
  draggable: editingEnabled,
  editable: editingEnabled,
  fillColor: 'green',
  fillOpacity: 0.7,
  strokeColor: 'limegreen',
  strokeOpacity: 1,
  strokeWeight: 2,
})

const FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED = (
  editingEnabled: boolean,
): google.maps.Data.StyleOptions => ({
  strokeColor: 'black',
  strokeOpacity: 1,
  strokeWeight: 4,
})

const SUPPORTED_PROPERTY_STYLE_OPTIONS: (keyof google.maps.Data.StyleOptions)[] =
  [
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

  private _terraDraw?: TerraDraw
  private _terraDrawReady = false
  private readonly _drawingSubject = new BehaviorSubject<boolean>(false)
  public readonly drawing$ = this._drawingSubject.asObservable()
  private _featureContextMenu: MenuComponent | null = null
  private _activeContextMenu: GoogleMapsContextMenu | null = null
  private _baseLatLng?: google.maps.LatLngLiteral
  private _padding?: number | google.maps.Padding

  private _allowDrawingHoleInPolygon = false

  // TODO: Move to a better place than the map wrapper service.
  private _fileInputHandler: ((file: File) => void) | undefined | null

  public googleMap?: google.maps.Map

  public readonly mapReady$: Observable<boolean>

  public get mapReady(): boolean {
    return this._mapReadySubject.value
  }

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
    if (this._terraDraw?.enabled) {
      this._terraDraw.stop()
    }
    this._terraDraw = undefined
    this._drawingSubject.complete()

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  public setMap(map: google.maps.Map): void {
    this.googleMap = map
    this._mapReadySubject.next(true)
    // Terra Draw's Google Maps adapter binds its event listeners to the map's
    // rendered '.gm-style' DOM subtree (located via querySelector). That subtree
    // does not exist yet when 'mapInitialized' fires, so initializing Terra Draw
    // synchronously here makes the adapter register listeners on a null element
    // and throw. Defer init until the map has rendered (first 'idle').
    google.maps.event.addListenerOnce(map, 'idle', () => this._initTerraDraw())
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
        this.googleMap.data.forEach((f) => {
          if (isFeatureSelected(f)) {
            setFeatureSelected(f, false)
          }
        })
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

  public fitBounds(
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
    padding?: number | google.maps.Padding,
  ): void {
    this._assertInitialized()
    this.googleMap.fitBounds(bounds, padding)
  }

  /**
   * Iterates the map's features and removes any that are selected.
   */
  public deleteSelection(): void {
    this._assertInitialized()
    const mapData = this.googleMap.data
    mapData.forEach((f) => {
      if (isFeatureSelected(f)) {
        mapData.remove(f)
      }
    })
  }

  /** Whether polygon drawing mode is currently active. */
  public isDrawing(): boolean {
    return this._terraDraw?.getMode() === 'polyline'
  }

  /** Enter polygon drawing mode. */
  public startDrawing(): void {
    if (!this._terraDraw || !this._terraDrawReady || !this.isEditingEnabled()) {
      return
    }
    this._terraDraw.setMode('polyline')
    this._drawingSubject.next(true)
  }

  /**
   * Cancel any in-progress drawing and leave drawing mode. Switching to the
   * `static` mode clears an unfinished line.
   */
  public stopDrawing(): void {
    if (!this._terraDraw || !this._terraDrawReady) {
      return
    }
    this._terraDraw.setMode('static')
    this._drawingSubject.next(false)
  }

  private _initTerraDraw(): void {
    if (notNullOrUndefined(this._terraDraw)) {
      throw Error(`Terra Draw is already initialized.`)
    }
    this._assertInitialized()

    // The Google Maps adapter creates an OverlayView on the map; ensure the map
    // element has an id (harmless if one is already present).
    const div = this.googleMap.getDiv() as HTMLElement
    if (!div.id) {
      div.id = `seam-google-map-${Math.floor(performance.now())}`
    }

    const draw = new TerraDraw({
      adapter: new TerraDrawGoogleMapsAdapter({
        lib: google.maps,
        map: this.googleMap,
        // Render Terra Draw's in-progress/finished geometry on its OWN Data
        // layer instead of the map's shared `map.data`. Without this, Terra
        // Draw's features land in the same layer this service manages, so the
        // exterior-feature search would match a just-drawn polygon against its
        // own rendered copy (cutting a hole equal to itself) and getGeoJson
        // would serialize Terra Draw's transient features.
        isolatedData: true,
      }),
      modes: [
        new TerraDrawPolyLineMode({
          // Draw as an open line that closes into a polygon when the start point
          // is clicked (the old Drawing manager's feel): while drawing you see a
          // line, and the shape only "fills in" once committed to the map's Data
          // layer, which is the clear "done" signal. No fill on Terra Draw's own
          // transient polygon. Terra Draw requires hex colors.
          styles: {
            lineStringColor: '#0000ff',
            lineStringWidth: 2,
            polygonFillOpacity: 0,
            polygonOutlineColor: '#0000ff',
            polygonOutlineWidth: 2,
          },
        }),
      ],
    })

    draw.on('ready', () => {
      this._terraDrawReady = true
      // Start in the resting (non-drawing) mode.
      draw.setMode('static')
    })

    draw.on('finish', (id, context) => {
      if (context.action !== 'draw') {
        return
      }
      this._ngZone.run(() => this._onDrawFinished(id))
    })

    draw.start()
    this._terraDraw = draw
  }

  public addControl(
    element: HTMLElement,
    position: google.maps.ControlPosition,
  ): void {
    this._assertInitialized()
    this.googleMap.controls[position].push(element)
  }

  public async setData(data: any): Promise<void> {
    this._assertInitialized()
    removeAllFeatures(this.googleMap.data)
    this.googleMap.data.addGeoJson(data)
    this.googleMap.fitBounds(
      getBoundsWithAllFeatures(this.googleMap.data),
      this._padding,
    )
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
    this.googleMap.fitBounds(
      getBoundsWithAllFeatures(this.googleMap.data),
      this._padding,
    )

    // TODO: Fix to pan to center. Currently fitBounds results in the expected
    // result, but pantToBounds animates.
    // this.googleMap.panToBounds(getBoundsWithAllFeatures(this.googleMap.data))
  }

  public allowDrawingHoleInPolygon(allow: boolean): void {
    this._allowDrawingHoleInPolygon = allow
  }

  public setFileInputHandler(
    handler: ((file: File) => void) | undefined | null,
  ): void {
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
    this.googleMap.addListener(
      'click',
      (even: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
        this._assertInitialized()
        this.googleMap.data.forEach((f) => setFeatureSelected(f, false))
      },
    )

    // Determine what the style of the features are.
    this.googleMap.data.setStyle((feature) => {
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
    this.googleMap.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        this._assertInitialized()

        setFeatureSelected(event.feature, true)
        this.googleMap.data.forEach((f) => {
          if (f !== event.feature && isFeatureSelected(f)) {
            setFeatureSelected(f, false)
          }
        })
      },
    )

    // Set a style on hovered features that can be selected.
    this.googleMap.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        this._assertInitialized()
        this.googleMap.data.revertStyle()

        if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
          this.setFeatureHoveredStyleOverride(event.feature)
        }
      },
    )

    // Remove any hover styles when mouse moves away.
    this.googleMap.data.addListener(
      'mouseout',
      (event: google.maps.Data.MouseEvent) => {
        this._assertInitialized()
        this.googleMap.data.revertStyle()
      },
    )
  }

  public setFeatureHoveredStyleOverride(feature: google.maps.Data.Feature) {
    this._assertInitialized()
    const overrideOpts = FEATURE_STYLE_OVERRIDE_OPTIONS_HOVERED(
      this.isEditingEnabled(),
    )
    const hoverOptions = getHoveredStyleOptionsDefinedByFeature(feature)
    this._mergeStyleOptions(overrideOpts, hoverOptions ?? {})
    this.googleMap.data.overrideStyle(feature, overrideOpts)
  }

  private _mergeStyleOptions(
    options: google.maps.Data.StyleOptions,
    propertiesStyleOptions: google.maps.Data.StyleOptions,
  ): void {
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

    createFeatureChangeObservable(this.googleMap.data, this._ngZone)
      .pipe(
        switchMap(() =>
          from(this.getGeoJson()).pipe(
            tap((geoJson) =>
              this._mapValueManager.setValue(
                geoJson,
                MapValueSource.FeatureChange,
              ),
            ),
          ),
        ),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this.googleMap.data.addListener(
      'contextmenu',
      (event: google.maps.Data.MouseEvent) => {
        if (!isFeatureSelected(event.feature)) {
          return
        }

        this._openContextMenuForFeature(
          event.feature,
          event.latLng ?? undefined,
        )
      },
    )
  }

  // TODO: Refactor out of the service meant to just wrap the google maps api.
  public hasSelectedFeature(): boolean {
    this._assertInitialized()
    let isSelected = false
    this.googleMap.data.forEach((f) => {
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
    this.googleMap.data.forEach((f) => {
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
  private _openContextMenuForFeature(
    feature: google.maps.Data.Feature,
    position?: google.maps.LatLng,
  ) {
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
      this.googleMap.data.toGeoJson((f) => {
        if (removeAppProperties) {
          stripAppFeaturePropertiesFromJson(f)
        }
        resolve(f)
      })
    })
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is WithRequired<
    GoogleMapsService,
    'googleMap'
  > {
    if (!this.googleMap && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(
        'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      )
    }
  }

  private _onDrawFinished(id: string | number): void {
    const feature = this._terraDraw?.getSnapshotFeature(id)
    this._terraDraw?.removeFeatures([id])
    this.stopDrawing()

    const drawn = feature ? this._toDrawnPolygon(feature.geometry) : undefined
    if (!drawn || !polygonHasMinDistinctVertices(drawn, 3)) {
      return
    }

    this._assertInitialized()

    const exteriorFeature = this._allowDrawingHoleInPolygon
      ? this._getPossibleExteriorFeature(drawn)
      : undefined

    if (exteriorFeature) {
      const exteriorPolygon = geoJsonPolygonFromDataFeature(exteriorFeature)
      if (exteriorPolygon) {
        const merged = addHoleToPolygon(exteriorPolygon, drawn)
        // Mutate the EXISTING feature instance to preserve its identity and
        // properties (see design constraints).
        exteriorFeature.setGeometry(dataPolygonFromGeoJson(merged))
        setFeatureSelected(exteriorFeature, true)
        return
      }
    }

    const newFeature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(drawn),
    })
    this.googleMap.data.add(newFeature)
    setFeatureSelected(newFeature, true)
  }

  /**
   * Normalize a finished Terra Draw geometry into a Polygon. A Polygon (the
   * user closed the line on its start point) passes through; an open LineString
   * (the user finished without closing) is closed into a polygon so nothing
   * they drew is discarded. Any other geometry type yields undefined.
   */
  private _toDrawnPolygon(geometry: Geometry): Polygon | undefined {
    if (geometry.type === 'Polygon') {
      return geometry
    }
    if (geometry.type === 'LineString') {
      const polygon: Polygon = {
        type: 'Polygon',
        coordinates: [[...geometry.coordinates]],
      }
      closePolygons(polygon)
      return polygon
    }
    return undefined
  }

  /**
   * Find an existing Polygon feature that fully contains the drawn polygon, so
   * the drawing can be applied as a cutout. Returns the existing feature
   * instance (never a copy).
   */
  private _getPossibleExteriorFeature(
    drawn: Polygon,
  ): google.maps.Data.Feature | undefined {
    this._assertInitialized()
    let match: google.maps.Data.Feature | undefined
    this.googleMap.data.forEach((f) => {
      if (match) {
        return
      }
      const candidate = geoJsonPolygonFromDataFeature(f)
      if (candidate && polygonContains(candidate, drawn)) {
        match = f
      }
    })
    return match
  }
}
