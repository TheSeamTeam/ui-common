import { Injectable, NgZone, OnDestroy, ViewContainerRef } from '@angular/core'
import { Geometry, Polygon } from 'geojson'
import { BehaviorSubject, from, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators'

import { TerraDraw, TerraDrawPolyLineMode } from 'terra-draw'
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter'

import { MenuComponent } from '@theseam/ui-common/menu'
import {
  closePolygons,
  notNullOrUndefined,
  polygonContains,
  polygonHasMinDistinctVertices,
} from '@theseam/ui-common/utils'

import {
  FeatureGroupRegistry,
  FeatureGroupRegistryOptions,
} from './feature-groups/feature-group-registry'
import {
  TheSeamMapFeatureGroup,
  TheSeamMapGroupTarget,
} from './feature-groups/feature-group'
import {
  computeFeatureHoverStyle,
  computeFeatureStyle,
} from './feature-style/compute-feature-style'
import { GoogleMapsContextMenu } from './google-maps-contextmenu'
import {
  applyHoleToFeature,
  createFeatureChangeObservable,
  dataPolygonFromGeoJson,
  getBoundsWithAllFeatures,
  getFeatureCenter,
  getFeaturesCount,
  isFeatureSelected,
  polygonsFromDataFeature,
  removeAllFeatures,
  setFeatureSelected,
  stripAppFeaturePropertiesFromJson,
} from './google-maps-feature-helpers'
import { GroupedInteractionModel } from './interaction/grouped-interaction-model'
import { TheSeamMapInteractionMode } from './interaction/interaction-mode'
import { LegacyInteractionModel } from './interaction/legacy-interaction-model'
import {
  MapInteractionContext,
  MapInteractionModel,
} from './interaction/map-interaction-model'
import {
  MapFeatureLabel,
  MapFeatureLabelsOverlay,
} from './labels/map-feature-labels-overlay'
import {
  MapValueManagerService,
  MapValueSource,
} from './map-value-manager.service'

declare const ngDevMode: boolean | undefined

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

  private _model: MapInteractionModel = new LegacyInteractionModel()
  private readonly _interactionModeSubject =
    new BehaviorSubject<TheSeamMapInteractionMode>('legacy')
  public readonly interactionMode$ = this._interactionModeSubject.asObservable()
  private _groups?: FeatureGroupRegistry
  private _groupOptions: FeatureGroupRegistryOptions = {}
  private _focusedFeature: google.maps.Data.Feature | null = null
  private _styleFn?: google.maps.Data.StylingFunction

  private _labelProperty: string | undefined
  private _labelsOverlay?: MapFeatureLabelsOverlay
  private _warnedAboutLabelDisagreement = false

  private readonly _selectionSubject =
    new BehaviorSubject<TheSeamMapGroupTarget | null>(null)
  /**
   * `distinctUntilChanged` collapses repeated `null`s. Several paths clear the
   * selection defensively — `setData`, `clearSelection`, the declarative
   * `selectedGroupKey` application on map-ready — and each would otherwise
   * emit its own `null` to consumers before the user has touched anything.
   *
   * Non-null targets are rebuilt on every change, so reference equality never
   * suppresses a real one, including re-selecting the same group with a
   * different focused polygon.
   */
  public readonly selection$ = this._selectionSubject.pipe(
    distinctUntilChanged(),
  )

  private readonly _hoverSubject =
    new BehaviorSubject<TheSeamMapGroupTarget | null>(null)
  /** Same reasoning as `selection$`; `mouseout` repeats `null` freely. */
  public readonly hover$ = this._hoverSubject.pipe(distinctUntilChanged())

  /**
   * The group of the feature a `contextmenu` event last landed on — distinct
   * from `selection$`, which the grouped "Delete Field" menu item must NOT
   * use, since in `'grouped'` mode the menu opens for any feature regardless
   * of what is selected.
   */
  private readonly _contextMenuTargetSubject =
    new BehaviorSubject<TheSeamMapGroupTarget | null>(null)
  public readonly contextMenuTarget$ =
    this._contextMenuTargetSubject.asObservable()

  private readonly _editModeSubject = new BehaviorSubject<boolean>(false)
  public readonly editMode$ = this._editModeSubject.asObservable()

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
    this._selectionSubject.complete()
    this._hoverSubject.complete()
    this._contextMenuTargetSubject.complete()
    this._editModeSubject.complete()
    this._interactionModeSubject.complete()
    this._groups = undefined

    this._labelsOverlay?.destroy()
    this._labelsOverlay = undefined

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
        this.setEditMode(false)
        this.clearSelection()
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
    // Every deleted feature was selected, so nothing should still read as
    // selected afterward. Re-sync `selection$` and `_focusedFeature` the same
    // way `deleteFocusedFeature()` and `setData()` already do, rather than
    // leaving them pointing at a group that no longer exists. In 'legacy'
    // mode nothing consumes selection$ today, and no remaining feature's raw
    // selected flag changes here (they were already false), so this is inert
    // there.
    this.clearSelection()
  }

  /**
   * Delete every feature in `key`'s group, regardless of what is currently
   * selected. Backs the grouped "Delete Field" context-menu item, which must
   * act on the right-clicked feature's group rather than whichever group
   * happens to be selected — see `deleteSelection()` for the
   * selection-scoped equivalent used elsewhere (the 'legacy' Delete item, and
   * the grouped Delete Field item's old, buggy wiring).
   */
  public deleteGroup(key: string): void {
    this._assertInitialized()
    const mapData = this.googleMap.data
    const wasSelected = this._selectionSubject.value?.group.key === key
    const focusedInGroup =
      this._focusedFeature !== null &&
      this._registry.keyOf(this._focusedFeature) === key
    const contextMenuTargetInGroup =
      this._contextMenuTargetSubject.value?.group.key === key

    this._registry.featuresIn(key).forEach((f) => mapData.remove(f))

    if (wasSelected) {
      this._applySelection(null, null)
    } else if (focusedInGroup) {
      this._focusedFeature = null
    }
    // The whole group is gone, so a context-menu target pointing at it — set
    // by whichever interaction opened the menu, not necessarily this one — is
    // now a dangling reference. Only clear it when it actually named this
    // group; an unrelated still-open menu's target must survive.
    if (contextMenuTargetInGroup) {
      this._contextMenuTargetSubject.next(null)
    }
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
    // Clear any selection when entering drawing mode, but only in 'legacy'
    // mode. There, a selected feature and the shape being drawn are unrelated,
    // so leaving the old one visibly selected would read as one shape. In
    // 'grouped' mode they are related: the selected group is exactly the
    // target the drawn polygon will join, so it keeps its selected styling —
    // `GroupedInteractionModel.featureFlags()` disarms its edit handles for
    // the duration instead (F3), so they don't compete with Terra Draw for
    // pointer events.
    if (this._model.id === 'legacy') {
      this._assertInitialized()
      this.googleMap.data.forEach((f) => {
        if (isFeatureSelected(f)) {
          setFeatureSelected(f, false)
        }
      })
    }
    this._terraDraw.setMode('polyline')
    this._drawingSubject.next(true)
    this._refreshStyles()
    this._labelsOverlay?.refresh()
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
    // Re-arms the selected group's edit handles in 'grouped' mode: nothing
    // else changes a feature's own properties here, so nothing else would
    // make Data re-evaluate the style function and pick up
    // `featureFlags().geometryEditingArmed` no longer being disarmed by
    // `isDrawing` (F3).
    this._refreshStyles()
    this._labelsOverlay?.refresh()
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

    const pointerDistance = 10

    // KNOWN ISSUE (upstream, unresolved): after repeated draws, Terra Draw can
    // intermittently lose pointer control of the Google Maps adapter, so input
    // pans the map instead of drawing until the page is reloaded. This is a race
    // between Terra Draw and the Google Maps adapter, tracked at
    // https://github.com/JamesLMilner/terra-draw/issues/710 (open as of
    // terra-draw 1.32.0 / adapter 1.6.1). It is not fixable in this wrapper;
    // revisit when the upstream issue is resolved.
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
          // Tighten how close a click must be to the first point to close the
          // polygon (Terra Draw's default ~40px felt too far / closed too
          // easily).
          pointerDistance,
          // Snap the moving vertex onto the line's OWN first point when the
          // cursor is within a few pixels of it, so it's clear the ends are
          // about to meet just before the click that closes the polygon.
          // (Terra Draw's built-in `toCoordinate` only snaps to OTHER features'
          // points — excluding the line being drawn — so it does nothing here.)
          snapping: {
            toCustom: (event, ctx) => {
              const geometry = ctx.getCurrentGeometrySnapshot()
              if (!geometry) {
                return undefined
              }
              const ring =
                geometry.type === 'LineString'
                  ? geometry.coordinates
                  : geometry.coordinates[0]
              // Only offer the closing snap once enough points exist to form a
              // polygon (placed points plus the live cursor point).
              if (!ring || ring.length < 4) {
                return undefined
              }
              const first = ring[0]
              const firstPixel = ctx.project(first[0], first[1])
              const distance = Math.hypot(
                firstPixel.x - event.containerX,
                firstPixel.y - event.containerY,
              )
              const SNAP_DISTANCE_PX = pointerDistance
              return distance <= SNAP_DISTANCE_PX ? first : undefined
            },
          },
          // Draw as an open line that closes into a polygon when the start point
          // is clicked (the old Drawing manager's feel): while drawing you see a
          // line, and the shape only "fills in" once committed to the map's Data
          // layer, which is the clear "done" signal. Black line, small white
          // closing/snapping dots (like the edit anchors), no fill on Terra
          // Draw's transient polygon. Terra Draw requires hex colors.
          styles: {
            lineStringColor: '#000000',
            lineStringWidth: 2,
            polygonFillOpacity: 0,
            polygonOutlineColor: '#000000',
            polygonOutlineWidth: 2,
            closingPointColor: '#ffffff',
            closingPointWidth: 4,
            closingPointOutlineColor: '#000000',
            closingPointOutlineWidth: 1,
            snappingPointColor: '#ffffff',
            snappingPointWidth: 4,
            snappingPointOutlineColor: '#000000',
            snappingPointOutlineWidth: 1,
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
    // Every prior feature is gone, so nothing selected or hovered survives it —
    // clear both rather than leaving selection$/hover$ referencing removed
    // features.
    this.clearSelection()
    this._hoverSubject.next(null)
    this._contextMenuTargetSubject.next(null)
    this.googleMap.data.addGeoJson(data)
    this.googleMap.fitBounds(
      getBoundsWithAllFeatures(this.googleMap.data),
      this._padding,
    )
    this._labelsOverlay?.refresh()
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

  public setInteractionMode(mode: TheSeamMapInteractionMode): void {
    this._model =
      mode === 'grouped'
        ? new GroupedInteractionModel()
        : new LegacyInteractionModel()
    if (mode !== 'grouped') {
      this._editModeSubject.next(false)
    }
    this._interactionModeSubject.next(mode)
    this._refreshStyles()
  }

  public setGroupOptions(options: FeatureGroupRegistryOptions): void {
    this._groupOptions = options
    this._groups?.setOptions(options)
    this._refreshStyles()
  }

  /**
   * Name of the GeoJSON property to render as a per-group label. `undefined`
   * removes labels entirely (and, until now set, means the overlay is never
   * even constructed).
   */
  public setLabelProperty(property: string | undefined): void {
    this._labelProperty = property
    if (!this.mapReady) {
      return
    }
    if (!property) {
      this._labelsOverlay?.destroy()
      this._labelsOverlay = undefined
      return
    }
    this._ensureLabelsOverlay()
    this._labelsOverlay?.refresh()
  }

  private _ensureLabelsOverlay(): void {
    this._assertInitialized()
    if (this._labelsOverlay) {
      return
    }
    this._labelsOverlay = new MapFeatureLabelsOverlay(() => this._buildLabels())
    this._labelsOverlay.setMap(this.googleMap)
  }

  private _buildLabels(): MapFeatureLabel[] {
    if (this.isDrawing()) {
      return []
    }
    const property = this._labelProperty
    if (!property) {
      return []
    }
    this._assertInitialized()

    const byKey = new Map<
      string,
      { text: string; bounds: google.maps.LatLngBounds; others: Set<string> }
    >()

    this.googleMap.data.forEach((feature) => {
      const key = this._registry.keyOf(feature)
      const raw = feature.getProperty(property)
      const text =
        raw === null || raw === undefined || raw === '' ? '' : String(raw)

      const existing = byKey.get(key)
      const bounds = existing?.bounds ?? new google.maps.LatLngBounds()
      feature.getGeometry()?.forEachLatLng((latLng) => bounds.extend(latLng))

      if (!existing) {
        byKey.set(key, { text, bounds, others: new Set(text ? [text] : []) })
        return
      }
      if (text) {
        existing.others.add(text)
        if (!existing.text) {
          existing.text = text
        }
      }
    })

    const labels: MapFeatureLabel[] = []
    for (const [key, entry] of byKey) {
      if (entry.others.size > 1) {
        this._warnAboutLabelDisagreement(key)
      }
      if (entry.text) {
        labels.push({ key, text: entry.text, bounds: entry.bounds })
      }
    }
    return labels
  }

  private _warnAboutLabelDisagreement(key: string): void {
    if (
      this._warnedAboutLabelDisagreement ||
      (typeof ngDevMode !== 'undefined' && !ngDevMode)
    ) {
      return
    }
    this._warnedAboutLabelDisagreement = true
    console.warn(
      `[seam-google-maps] features in group "${key}" carry different ` +
        `"${this._labelProperty}" values. One is rendered; which is ` +
        `unspecified. Keeping them consistent is the consumer's business.`,
    )
  }

  public isEditMode(): boolean {
    return this._editModeSubject.value
  }

  public setEditMode(enabled: boolean): void {
    if (this._model.id !== 'grouped' || enabled === this.isEditMode()) {
      return
    }
    if (!enabled) {
      const wasDrawing = this.isDrawing()
      this.stopDrawing()
      if (wasDrawing) {
        this._reapplyCurrentSelection()
      }
    }
    this._editModeSubject.next(enabled)
    this._refreshStyles()
  }

  /**
   * Re-run the style callback for every feature.
   *
   * Google re-evaluates the callback whenever the style is set, so handing
   * back the same stored function is enough to repaint after a mode change.
   */
  private _refreshStyles(): void {
    if (!this.mapReady || !this._styleFn) {
      return
    }
    this._assertInitialized()
    this.googleMap.data.setStyle(this._styleFn)
  }

  private get _registry(): FeatureGroupRegistry {
    this._assertInitialized()
    if (!this._groups) {
      this._groups = new FeatureGroupRegistry(
        this.googleMap.data,
        this._groupOptions,
      )
    }
    return this._groups
  }

  private _interactionContext(): MapInteractionContext {
    return {
      groups: this._registry,
      editingEnabled: this.isEditingEnabled(),
      allowHoles: this._allowDrawingHoleInPolygon,
      editMode: this.isEditMode(),
      isDrawing: this.isDrawing(),
      getSelectedKey: () => this._selectionSubject.value?.group.key ?? null,
      selectGroup: (key, feature) => this._applySelection(key, feature),
      startDrawing: () => this.startDrawing(),
      findContainingFeature: (polygon, groupKey, accept) =>
        this._findContainingFeature(polygon, groupKey, accept),
    }
  }

  /**
   * Find an existing feature that fully contains `polygon`, restricted to a
   * group when `groupKey` is given and to features `accept` returns true for
   * when given. Matches any part of a MultiPolygon.
   *
   * `accept` is applied DURING iteration — a rejected candidate is skipped,
   * not treated as ending the search — so legacy mode's Polygon-only filter
   * can let a later Polygon candidate still match.
   */
  private _findContainingFeature(
    polygon: Polygon,
    groupKey?: string,
    accept?: (feature: google.maps.Data.Feature) => boolean,
  ): google.maps.Data.Feature | undefined {
    this._assertInitialized()
    let match: google.maps.Data.Feature | undefined
    this.googleMap.data.forEach((feature) => {
      if (match) {
        return
      }
      if (
        groupKey !== undefined &&
        this._registry.keyOf(feature) !== groupKey
      ) {
        return
      }
      if (accept && !accept(feature)) {
        return
      }
      const contains = polygonsFromDataFeature(feature).some((part) =>
        polygonContains(part, polygon),
      )
      if (contains) {
        match = feature
      }
    })
    return match
  }

  private _applySelection(
    key: string | null,
    feature: google.maps.Data.Feature | null,
  ): void {
    this._assertInitialized()

    this._focusedFeature = feature
    const selectedFeatures = key === null ? [] : this._registry.featuresIn(key)

    this.googleMap.data.forEach((f) => {
      const shouldSelect = selectedFeatures.indexOf(f) !== -1
      if (isFeatureSelected(f) !== shouldSelect) {
        setFeatureSelected(f, shouldSelect)
      }
    })

    if (key === null) {
      this._selectionSubject.next(null)
      return
    }

    const resolved = this._registry.groupWithSources(key)
    if (!resolved) {
      this._selectionSubject.next(null)
      return
    }
    this._selectionSubject.next(this._targetFor(resolved, feature))
  }

  /**
   * Pair a group with the emitted GeoJSON for one of its `Data.Feature`s.
   *
   * Indexes into the returned source array rather than `featuresIn()`, because
   * a feature with unsupported geometry is dropped from the emitted list and
   * would shift every index after it.
   */
  private _targetFor(
    resolved: {
      group: TheSeamMapFeatureGroup
      sources: google.maps.Data.Feature[]
    },
    feature: google.maps.Data.Feature | null,
  ): TheSeamMapGroupTarget {
    const index = feature ? resolved.sources.indexOf(feature) : -1
    return {
      group: resolved.group,
      feature: index === -1 ? null : resolved.group.features[index],
    }
  }

  public selectGroup(key: string | null): boolean {
    this._assertInitialized()
    if (key === null) {
      this._applySelection(null, null)
      return true
    }
    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return false
    }
    this._applySelection(key, features[0])
    return true
  }

  public clearSelection(): void {
    this._applySelection(null, null)
  }

  public getGroups(): TheSeamMapFeatureGroup[] {
    return this._registry.groups()
  }

  private _boundsForGroup(key: string): google.maps.LatLngBounds | undefined {
    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return undefined
    }
    const bounds = new google.maps.LatLngBounds()
    features.forEach((f) =>
      f.getGeometry()?.forEachLatLng((latLng) => bounds.extend(latLng)),
    )
    return bounds
  }

  public fitGroup(
    key: string,
    padding?: number | google.maps.Padding,
  ): boolean {
    this._assertInitialized()
    const bounds = this._boundsForGroup(key)
    if (!bounds) {
      return false
    }
    this.googleMap.fitBounds(bounds, padding ?? this._padding)
    return true
  }

  public panToGroup(key: string): boolean {
    this._assertInitialized()
    const bounds = this._boundsForGroup(key)
    if (!bounds) {
      return false
    }
    this.googleMap.panTo(bounds.getCenter())
    return true
  }

  /**
   * Delete only the polygon the last interaction landed on.
   *
   * Re-applies the selection's group key afterward (with no focused feature)
   * rather than leaving `selection$` holding a `TheSeamMapGroupTarget` whose
   * `feature` no longer exists — `_applySelection` naturally clears to null
   * when the group is now empty, via `groupWithSources`.
   */
  public deleteFocusedFeature(): void {
    this._assertInitialized()
    const key = this._focusedFeature
      ? this._registry.keyOf(this._focusedFeature)
      : (this._selectionSubject.value?.group.key ?? null)
    const contextMenuTargetInGroup =
      key !== null && this._contextMenuTargetSubject.value?.group.key === key

    if (this._focusedFeature) {
      this.googleMap.data.remove(this._focusedFeature)
      this._focusedFeature = null
    } else {
      this.deleteSelection()
    }

    this._applySelection(key, null)
    // Same reasoning as deleteGroup(): a context-menu target naming this
    // group may now reference a removed feature (or a stale feature count),
    // so clear it — but only when it actually named this group.
    if (contextMenuTargetInGroup) {
      this._contextMenuTargetSubject.next(null)
    }
  }

  /** Escape cascades: cancel a draw, then clear selection, then leave edit mode. */
  public handleEscape(): void {
    if (this.isDrawing()) {
      this.stopDrawing()
      this._reapplyCurrentSelection()
      return
    }
    if (this._selectionSubject.value !== null) {
      this.clearSelection()
      return
    }
    if (this.isEditMode()) {
      this.setEditMode(false)
    }
  }

  /**
   * `startDrawing()` raw-deselects every feature (via `setFeatureSelected`)
   * without touching `_selectionSubject`, so that `onDrawFinished` can still
   * read `getSelectedKey()` for the group being drawn into. When a draw ends
   * WITHOUT producing a finished feature — cancelled by `Escape` or
   * `setEditMode(false)`, or a `finish` event with no valid geometry — nothing
   * else re-applies those raw flags, so the map renders the selection as gone
   * while `selection$`/`getSelectedKey()` still report it. Call this at every
   * such stopping point to bring the two back in sync.
   *
   * Not called from the successful-finish path in `_onDrawFinished`: that
   * path calls `_applySelection` itself with the new/joined selection, and
   * doing it here first would only add a redundant, momentarily-stale
   * `selectionChange` emission ahead of the real one.
   */
  private _reapplyCurrentSelection(): void {
    if (this._model.id !== 'grouped') {
      return
    }
    const currentKey = this._selectionSubject.value?.group.key ?? null
    this._applySelection(currentKey, this._focusedFeature)
  }

  private _initFeatureStyling(): void {
    this._assertInitialized()

    this.googleMap.addListener('click', () => {
      this._model.onMapClick(this._interactionContext())
    })

    this._styleFn = (feature) =>
      computeFeatureStyle(feature, {
        editingEnabled: this.isEditingEnabled(),
        ...this._model.featureFlags(feature, this._interactionContext()),
      })
    this.googleMap.data.setStyle(this._styleFn)

    this.googleMap.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        // While drawing, a click on a polygon is placing a vertex.
        if (this.isDrawing()) {
          return
        }
        this._model.onFeatureClick(event.feature, this._interactionContext())
      },
    )

    this.googleMap.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        this._assertInitialized()
        this.googleMap.data.revertStyle()

        if (!this.isDrawing() && !isFeatureSelected(event.feature)) {
          this.setFeatureHoveredStyleOverride(event.feature)
        }

        const resolved = this._registry.groupWithSources(
          this._registry.keyOf(event.feature),
        )
        this._hoverSubject.next(
          resolved ? this._targetFor(resolved, event.feature) : null,
        )
      },
    )

    this.googleMap.data.addListener('mouseout', () => {
      this._assertInitialized()
      this.googleMap.data.revertStyle()
      this._hoverSubject.next(null)
    })
  }

  public setFeatureHoveredStyleOverride(feature: google.maps.Data.Feature) {
    this._assertInitialized()
    this.googleMap.data.overrideStyle(
      feature,
      computeFeatureHoverStyle(feature),
    )
  }

  private _initFeatureChangeListeners(): void {
    this._assertInitialized()

    createFeatureChangeObservable(this.googleMap.data, this._ngZone)
      .pipe(
        switchMap(() =>
          from(this.getGeoJson()).pipe(
            tap((geoJson) => {
              this._mapValueManager.setValue(
                geoJson,
                MapValueSource.FeatureChange,
              )
              this._labelsOverlay?.refresh()
            }),
          ),
        ),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this.googleMap.data.addListener(
      'contextmenu',
      (event: google.maps.Data.MouseEvent) => {
        if (
          !this._model.allowsContextMenu(
            event.feature,
            this._interactionContext(),
          )
        ) {
          return
        }
        this._setContextMenuTarget(event.feature)
        this._openContextMenuForFeature(
          event.feature,
          event.latLng ?? undefined,
        )
      },
    )
  }

  /**
   * Establish `feature` as what the context menu is about to open for:
   * `_focusedFeature` (what "Delete Polygon" acts on) and
   * `contextMenuTarget$` (what "Delete Field" is gated on and acts on) both
   * follow it. Shared by the `contextmenu` mouse listener and
   * `openContextMenu()`'s keyboard path so the two establish the target
   * identically — the menu's target must always be the feature the menu was
   * opened for, on either path. Before this, only the mouse listener set
   * `contextMenuTarget$`, so pressing the `ContextMenu` key could open a menu
   * over whatever was CURRENTLY selected while still offering "Delete Field"
   * for whatever a PRIOR right-click had targeted.
   */
  private _setContextMenuTarget(feature: google.maps.Data.Feature): void {
    this._focusedFeature = feature
    const resolved = this._registry.groupWithSources(
      this._registry.keyOf(feature),
    )
    this._contextMenuTargetSubject.next(
      resolved ? this._targetFor(resolved, feature) : null,
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
    if (
      feature &&
      this._model.allowsContextMenu(feature, this._interactionContext())
    ) {
      this._setContextMenuTarget(feature)
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
      // A 'finish' event that produced no usable geometry is, for selection
      // purposes, a cancelled draw — see _reapplyCurrentSelection().
      this._reapplyCurrentSelection()
      return
    }

    this._assertInitialized()

    const context = this._interactionContext()
    const outcome = this._model.onDrawFinished(drawn, context)

    if (outcome.kind === 'hole' && applyHoleToFeature(outcome.target, drawn)) {
      this._applySelection(this._registry.keyOf(outcome.target), outcome.target)
      this._labelsOverlay?.refresh()
      return
    }

    const newFeature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(drawn),
    })
    this.googleMap.data.add(newFeature)

    const key =
      outcome.kind === 'newFeature' && outcome.groupKey !== null
        ? (this._registry.assignKey(newFeature, outcome.groupKey),
          outcome.groupKey)
        : this._registry.assignNewKey(newFeature)

    this._applySelection(key, newFeature)
    this._labelsOverlay?.refresh()
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
}
