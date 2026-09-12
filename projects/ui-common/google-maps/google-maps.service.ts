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
  featureAllows,
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

/**
 * A delete that has been resolved to the features it would remove and the
 * target to consult `canDelete` with. Built by `_deletionOf`; `null` there
 * means there is nothing to delete at all, which is not a refusal.
 */
interface ResolvedDeletion {
  removing: google.maps.Data.Feature[]
  target: TheSeamMapGroupTarget
  /**
   * The delete removes a feature that no target can honestly name: it is
   * absent from `groupWithSources().sources` (its geometry is neither Polygon
   * nor MultiPolygon), so it appears in no `group.features` the consumer has
   * ever seen, while the group itself survives the delete.
   *
   * Only ever true for a delete that does NOT empty the group — when the group
   * is emptied, `feature: null` is honest regardless of what is being removed.
   */
  unnamable: boolean
}

@Injectable()
export class GoogleMapsService implements OnDestroy {
  private readonly _ngUnsubscribe = new Subject<void>()

  private readonly _mapReadySubject = new BehaviorSubject<boolean>(false)
  private readonly _editingEnabledSubject = new BehaviorSubject<boolean>(true)

  private _terraDraw?: TerraDraw
  private _terraDrawReady = false
  // Terra Draw's Google Maps adapter can lose pointer capture at the adapter
  // level after a completed draw session (terra-draw#710): every click after
  // that lands on nothing, and a drag pans the map instead of editing.
  // Recreating the whole `TerraDraw` instance (and its adapter) is the only
  // thing that restores it. `stopDrawing()` triggers this — EAGERLY, right
  // when the session ends, not lazily on the next `startDrawing()` — but
  // only for a session that actually placed a coordinate (see
  // `_hasPlacedVertex()`): that is the only kind that ever touched the
  // adapter's pointer capture, so an armed-but-empty session (armed, then
  // cancelled with zero vertices placed — e.g. by `Escape`, or by
  // `setEditMode(true)`'s auto-arm getting turned straight back off) does
  // not need it and does not pay for it.
  //
  // Recreating eagerly (rather than deferring to the next `startDrawing()`)
  // means the new instance's `ready` has every chance to have already fired
  // by the time the user's NEXT click asks to start a second draw, so that
  // click is not the one racing the async gap. A `startDrawing()` call that
  // still arrives before `ready` fires — instance rebuild is fast but not
  // free — queues itself via `_pendingStartDrawing` below rather than being
  // dropped, so nothing is lost even in that case.
  private _pendingStartDrawing = false
  /**
   * One-shot suppression for the map `click` listener, armed the instant a
   * draw finishes (see `_armMapClickSuppression()` for why, and its call
   * site in `_onDrawFinished()`).
   *
   * `domEvent.timeStamp` was tried first, since it is a `DOMHighResTimeStamp`
   * on the same origin as `performance.now()` and looks like a clean,
   * delay-free discriminator: a stale click's timestamp should predate the
   * moment the draw finished. It does not hold up empirically. Driving real
   * mouse draws against the live Storybook and logging both the map `click`
   * listener and `stopDrawing()` (see .superpowers/closing-click-report.md)
   * caught the echo repeatedly, and every single time its `domEvent.timeStamp`
   * was a few milliseconds AFTER `stopDrawing()`'s own timestamp, not before
   * — indistinguishable from a genuinely fresh click by timestamp alone.
   * Google appears to stamp its own synthetic `click` at the moment IT
   * dispatches, not at the original pointer event's time, so there is no
   * "stale-looking" timestamp to compare against.
   */
  private _suppressNextMapClick = false
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

  private _canDelete: ((target: TheSeamMapGroupTarget) => boolean) | undefined

  private readonly _deleteBlockedSubject = new Subject<TheSeamMapGroupTarget>()
  /**
   * A delete that was attempted and refused. Fires only from the three delete
   * commands, never from their `canDelete*` queries — rendering a menu is not
   * an attempt.
   */
  public readonly deleteBlocked$ = this._deleteBlockedSubject.asObservable()

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
   * The group of the feature a `contextmenu` event last landed on. Kept
   * distinct from `selection$` even though `allowsContextMenu()` now requires
   * the right-clicked feature's group to already be the selection — so, for
   * as long as the menu stays open, the two are provably the same group.
   * Collapsing onto `selection$` would re-couple "what the menu acts on" to
   * "whatever is currently selected", which is exactly the coupling this
   * subject was introduced to break when the menu could still open for a
   * non-selected group. That rule has already moved twice; keeping this
   * separate means a future loosening of `allowsContextMenu()` does not have
   * to re-invent it.
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
    this._disposeTerraDraw()
    this._drawingSubject.complete()
    this._selectionSubject.complete()
    this._hoverSubject.complete()
    this._contextMenuTargetSubject.complete()
    this._editModeSubject.complete()
    this._interactionModeSubject.complete()
    this._deleteBlockedSubject.complete()
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
  private _removeSelection(): void {
    this._assertInitialized()
    const mapData = this.googleMap.data
    mapData.forEach((f) => {
      if (isFeatureSelected(f)) {
        mapData.remove(f)
      }
    })
    // Every deleted feature was selected, so nothing should still read as
    // selected afterward. Re-sync `selection$` and `_focusedFeature` the same
    // way `_removeFocusedFeature()` and `setData()` already do, rather than
    // leaving them pointing at a group that no longer exists. In 'legacy'
    // mode nothing consumes selection$ today, and no remaining feature's raw
    // selected flag changes here (they were already false), so this is inert
    // there.
    this.clearSelection()
  }

  /**
   * The consumer's veto. Consulted for every delete on every path, and for
   * whether to offer a delete at all.
   */
  public setCanDelete(
    predicate: ((target: TheSeamMapGroupTarget) => boolean) | undefined | null,
  ): void {
    this._canDelete = predicate ?? undefined
  }

  /**
   * Pair a set of features to remove with the target to consult `canDelete`
   * with. `null` when there is nothing to delete — distinct from a refusal,
   * and the reason no honest target exists to report.
   *
   * Builds `target.feature` itself rather than delegating the decision to
   * `_targetFor`. There, `feature: null` means only "no particular feature";
   * here it is a promise that the whole group is about to cease to exist.
   * Conflating the two is what let a delete of ONE polygon be consulted as a
   * group delete — see `ResolvedDeletion.unnamable`.
   */
  private _deletionOf(
    key: string | null,
    removing: google.maps.Data.Feature[],
  ): ResolvedDeletion | null {
    if (key === null || removing.length === 0) {
      return null
    }
    const resolved = this._registry.groupWithSources(key)
    if (!resolved) {
      return null
    }
    // The empty-group invariant: a delete that leaves the group with no
    // features at all is a group delete, whichever path asked for it — so
    // `feature: null` always means "this group is about to cease to exist"
    // and a consumer never has to count features itself. Compared against
    // `featuresIn`, not `resolved.sources`, because a feature with
    // unsupported geometry is missing from `sources` but still occupies the
    // group.
    const all = this._registry.featuresIn(key)
    const emptiesGroup = all.every((f) => removing.indexOf(f) !== -1)
    if (emptiesGroup) {
      // `feature: null` is honest here whatever `removing` holds: the group
      // really is going, unsupported-geometry members included. This case is
      // never at risk, so it is never `unnamable`.
      return {
        removing,
        target: { group: resolved.group, feature: null },
        unnamable: false,
      }
    }

    // The group survives, so the target must name the polygon being removed.
    const index = resolved.sources.indexOf(removing[0])
    if (index === -1) {
      // The feature being removed is absent from `sources`: its geometry is
      // neither Polygon nor MultiPolygon, so `groupWithSources` dropped it and
      // it has no emitted GeoJSON counterpart. It has never appeared in any
      // `group.features` the consumer has seen, so NO value of
      // `target.feature` describes it — which is exactly why this deletion is
      // `unnamable` and `_mayDeleteResolved()` refuses it outright whenever a
      // predicate is set.
      //
      // `feature: null` is the least dishonest option available. It overstates
      // the scope — it reads as "the field is going" when only one polygon
      // was asked for — but it names the right group, and it is only ever READ
      // on the `deleteBlocked$` emission that reports the refusal: the
      // predicate is refused before it is ever consulted with this target, and
      // with no predicate set nothing observes it at all. A target that only
      // ever reports a refusal cannot authorise a removal, so the overstatement
      // is inert. The alternative was emitting nothing, which would leave a
      // refused delete indistinguishable from a successful one on the design's
      // only feedback channel.
      return {
        removing,
        target: { group: resolved.group, feature: null },
        unnamable: true,
      }
    }
    return {
      removing,
      target: {
        group: resolved.group,
        feature: resolved.group.features[index],
      },
      unnamable: false,
    }
  }

  /** Resolves the same features `_removeSelection()` would remove. */
  private _selectionDeletion() {
    this._assertInitialized()
    const removing: google.maps.Data.Feature[] = []
    this.googleMap.data.forEach((f) => {
      if (isFeatureSelected(f)) {
        removing.push(f)
      }
    })
    if (removing.length === 0) {
      return null
    }
    return this._deletionOf(this._registry.keyOf(removing[0]), removing)
  }

  /** Resolves the same features `_removeFocusedFeature()` would remove. */
  private _focusedFeatureDeletion() {
    const focused = this._focusedFeature
    if (focused === null) {
      return this._selectionDeletion()
    }
    return this._deletionOf(this._registry.keyOf(focused), [focused])
  }

  /** Resolves the same features `_removeGroup(key)` would remove. */
  private _groupDeletion(key: string) {
    return this._deletionOf(key, this._registry.featuresIn(key))
  }

  /**
   * Whether `removing` may be deleted: the feature-declared lock first, then
   * the consumer's predicate.
   *
   * MUST stay pure. It also answers menu-render questions, which are not
   * delete attempts — a side effect here would fire on every right-click.
   */
  private _mayDelete(
    removing: google.maps.Data.Feature[],
    target: TheSeamMapGroupTarget,
  ): boolean {
    // A feature the consumer locked against reshaping must not be removable
    // by another route: deleting a polygon changes the map's value at least
    // as much as reshaping it does. Same precedent as editable: false
    // implying draggable: false in compute-feature-style.ts.
    if (removing.some((f) => !featureAllows(f, 'editable'))) {
      return false
    }
    return this._canDelete?.(target) ?? true
  }

  /**
   * Whether a resolved deletion may proceed. The single gate every query and
   * every command goes through.
   *
   * Wraps `_mayDelete` with the one refusal that cannot be phrased as a
   * question about a target: an `unnamable` delete. Consulting the predicate
   * there would mean LYING to it — handing it `feature: null`, which promises
   * the whole group is about to cease to exist, for a delete that removes one
   * polygon and leaves the rest standing. A consumer whose rule is "a field
   * may be deleted, an individual polygon may not" answers `true` to that and
   * loses a polygon it meant to keep. Fail closed exactly where a consumer's
   * rule could be subverted.
   *
   * Only when a predicate is actually set. With none there is nobody to lie
   * to, so there is nothing to protect — and refusing unconditionally would
   * change 'legacy' mode's behaviour for unsupported-geometry features, which
   * two applications depend on and this work must not drift.
   *
   * Pure, like `_mayDelete`: it also answers menu-render questions.
   */
  private _mayDeleteResolved(deletion: ResolvedDeletion): boolean {
    if (deletion.unnamable && this._canDelete !== undefined) {
      return false
    }
    return this._mayDelete(deletion.removing, deletion.target)
  }

  /** Whether "Delete Polygon" (or the `Delete` key) may act. */
  public canDeleteFocusedFeature(): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._focusedFeatureDeletion()
    return deletion !== null && this._mayDeleteResolved(deletion)
  }

  /** Whether "Delete Field" may act on `key`. */
  public canDeleteGroup(key: string): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._groupDeletion(key)
    return deletion !== null && this._mayDeleteResolved(deletion)
  }

  /** Whether the legacy "Delete" item (or the `Delete` key) may act. */
  public canDeleteSelection(): boolean {
    if (!this.mapReady) {
      return false
    }
    const deletion = this._selectionDeletion()
    return deletion !== null && this._mayDeleteResolved(deletion)
  }

  /**
   * Remove every selected feature, unless `canDelete` or a feature's own
   * `editable: false` refuses. A refused delete emits on `deleteBlocked$` and
   * changes nothing.
   */
  public deleteSelection(): void {
    this._assertInitialized()
    const deletion = this._selectionDeletion()
    if (deletion !== null && !this._mayDeleteResolved(deletion)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeSelection()
  }

  /**
   * Delete every feature in `key`'s group. Backs the grouped "Delete Field"
   * context-menu item.
   *
   * `allowsContextMenu()` now requires the right-clicked feature's group to
   * already be the selection, so `key` here is always the selected group's
   * key by the time this runs — making this call equivalent in practice to
   * `deleteSelection()`. Kept as its own method anyway: it names the thing
   * the menu item actually acts on (the group the menu opened for) rather
   * than relying on the coincidence that it currently matches whatever is
   * selected, a coincidence this design has already stopped being true once
   * before and could again.
   */
  private _removeGroup(key: string): void {
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

  /**
   * Remove every feature in `key`'s group, unless `canDelete` or a feature's
   * own `editable: false` refuses. A refused delete emits on `deleteBlocked$`
   * and changes nothing.
   */
  public deleteGroup(key: string): void {
    this._assertInitialized()
    const deletion = this._groupDeletion(key)
    if (deletion !== null && !this._mayDeleteResolved(deletion)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeGroup(key)
  }

  /**
   * Whether polygon drawing mode is currently active.
   *
   * Reads `_drawingSubject` — set by `startDrawing()`/`stopDrawing()`, which
   * this service fully controls — rather than asking Terra Draw's own
   * `getMode()`. The two are kept in lockstep by every call to those two
   * methods, so this is not a behaviour change; it exists so a stuck Terra
   * Draw mode can never silently disagree with, and disarm, the rest of this
   * service's drawing-state bookkeeping (F3's `geometryEditingArmed`
   * included). `stopDrawing()` still always calls `_terraDraw.setMode('static')`
   * to make Terra Draw itself release its cursor override and any
   * in-progress geometry, regardless of which source `isDrawing()` reads.
   */
  public isDrawing(): boolean {
    return this._drawingSubject.value
  }

  /** Enter polygon drawing mode. */
  public startDrawing(): void {
    if (
      !this._terraDraw ||
      !this.isEditingEnabled() ||
      // Already drawing: `setMode('polyline')` resets the in-progress path,
      // so a click that lands here mid-draw (F4) must not re-enter drawing
      // mode. `onMapClick` already guards on `context.isDrawing` before
      // calling in, and the map `click` listener guards on `isDrawing()`
      // before calling the model at all — this is the last line of defence.
      this.isDrawing()
    ) {
      return
    }
    if (!this._terraDrawReady) {
      // A `TerraDraw` recreate is in flight — either the eager rebuild
      // `stopDrawing()` kicks off after a real draw session ends (see
      // `_hasPlacedVertex()`), or, rarely, first-ever init hasn't reported
      // `ready` yet. Recreation itself is synchronous, but the new
      // instance's `ready` event is not (see `_createTerraDraw()`), so queue
      // this call rather than silently dropping the click that made it —
      // the `ready` handler below finishes entering drawing mode once the
      // new instance is actually usable.
      this._pendingStartDrawing = true
      return
    }
    this._enterDrawingMode()
  }

  /**
   * Clear any selection when entering drawing mode, but only in 'legacy'
   * mode. There, a selected feature and the shape being drawn are unrelated,
   * so leaving the old one visibly selected would read as one shape. In
   * 'grouped' mode they are related: the selected group is exactly the
   * target the drawn polygon will join, so it keeps its selected styling —
   * `GroupedInteractionModel.featureFlags()` disarms its edit handles for
   * the duration instead (F3), so they don't compete with Terra Draw for
   * pointer events.
   *
   * Split out of `startDrawing()` so a recreate-in-flight (see
   * `_pendingStartDrawing`) can defer this until the new instance's `ready`
   * event actually fires, instead of entering drawing mode against an
   * instance that isn't ready yet.
   */
  private _enterDrawingMode(): void {
    this._assertInitialized()
    if (this._model.id === 'legacy') {
      this.googleMap.data.forEach((f) => {
        if (isFeatureSelected(f)) {
          setFeatureSelected(f, false)
        }
      })
    }
    this._terraDraw?.setMode('polyline')
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
    const wasDrawing = this.isDrawing()
    // Read BEFORE setMode('static') below — switching the active mode away
    // stops it, which resets its own state, so this only means anything
    // while the polyline mode is still the one active.
    const placedVertex = wasDrawing && this._hasPlacedVertex()
    this._terraDraw.setMode('static')
    this._drawingSubject.next(false)
    if (placedVertex) {
      // A real draw session — one that actually placed a coordinate, and so
      // actually engaged the adapter's pointer capture — just ended
      // (finished OR cancelled). That capture is what terra-draw#710 can
      // leave broken. An armed-but-empty session (armed via a click, or via
      // setEditMode(true)'s auto-arm, then cancelled — e.g. by Escape —
      // with zero vertices placed) never touched it and does not need this.
      //
      // Recreate EAGERLY, right now, rather than deferring to the next
      // startDrawing() call: the new instance then has the rest of this
      // moment, plus however long the user takes to look at what they just
      // did, to finish coming up — so the click that starts the NEXT draw
      // does not itself race the async `ready` gap. `startDrawing()`'s own
      // `!_terraDrawReady` branch (queuing via `_pendingStartDrawing`) is
      // the safety net for a start that still arrives before `ready` fires.
      this._recreateTerraDraw()
    }
    // Re-arms the selected group's edit handles in 'grouped' mode: nothing
    // else changes a feature's own properties here, so nothing else would
    // make Data re-evaluate the style function and pick up
    // `featureFlags().geometryEditingArmed` no longer being disarmed by
    // `isDrawing` (F3).
    this._refreshStyles()
    this._labelsOverlay?.refresh()
  }

  /**
   * Whether the active Terra Draw mode has actually placed a coordinate.
   * Terra Draw's own mode state machine transitions from `'started'`
   * (armed, no coordinate committed yet) to `'drawing'` the instant the
   * first vertex lands (`TerraDrawPolyLineMode`'s internal `setDrawing()`,
   * confirmed against `terra-draw`'s own source). Read directly from Terra
   * Draw's state rather than inferred from this service's own flags, so it
   * reflects whether the adapter's pointer capture was actually
   * engaged — the thing terra-draw#710 is actually about — rather than
   * merely whether this service thought a draw was armed.
   */
  private _hasPlacedVertex(): boolean {
    return this._terraDraw?.getModeState() === 'drawing'
  }

  /**
   * Stop (if running) and drop the current `TerraDraw` instance. `TerraDraw#
   * stop()` deregisters its adapter, which for the Google Maps adapter's
   * `isolatedData: true` mode calls `this._data.setMap(null)` and drops the
   * reference — so this never leaves an orphaned or duplicate Data layer
   * behind, across any number of calls.
   */
  private _disposeTerraDraw(): void {
    if (this._terraDraw?.enabled) {
      this._terraDraw.stop()
    }
    this._terraDraw = undefined
    this._terraDrawReady = false
  }

  /**
   * Dispose the current `TerraDraw` instance (and its adapter) and build a
   * fresh one in its place. This is the terra-draw#710 recovery: the old
   * instance's listeners die with it (its adapter is deregistered by
   * `stop()`, so nothing further reaches it), and `_createTerraDraw()` wires
   * up brand new `ready`/`finish` listeners on the new instance — never the
   * stale closures from a previous instance.
   */
  private _recreateTerraDraw(): void {
    this._disposeTerraDraw()
    this._terraDraw = this._createTerraDraw()
  }

  private _initTerraDraw(): void {
    if (notNullOrUndefined(this._terraDraw)) {
      throw Error(`Terra Draw is already initialized.`)
    }
    this._terraDraw = this._createTerraDraw()
  }

  /**
   * Build and start a new `TerraDraw` instance with its Google Maps adapter,
   * wiring up this instance's own `ready`/`finish` listeners. Called both by
   * `_initTerraDraw()` (first-ever init, guarded against running twice) and
   * by `_recreateTerraDraw()` (every terra-draw#710 recovery afterward) —
   * the guard against accidental double-init only lives in `_initTerraDraw()`
   * itself, so recreation is free to call this as many times as needed.
   */
  private _createTerraDraw(): TerraDraw {
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
      // A `startDrawing()` call arrived while THIS instance was still
      // starting up (terra-draw#710 recovery, or plain first-time init) and
      // queued itself rather than being dropped — finish the job now, but
      // only if nothing since then made drawing invalid: editing disabled,
      // somehow already drawing, or — grouped mode only, where edit mode is
      // its own on/off concept `startDrawing()` itself never re-checks —
      // edit mode having been turned off while this was in flight. Mirrors
      // exactly the check `GroupedInteractionModel.onMapClick()` made before
      // calling in, just re-run after the async gap instead of trusting it
      // still holds.
      if (this._pendingStartDrawing) {
        this._pendingStartDrawing = false
        const stillValid =
          this.isEditingEnabled() &&
          !this.isDrawing() &&
          (this._model.id !== 'grouped' || this.isEditMode())
        if (stillValid) {
          this._enterDrawingMode()
        }
      }
    })

    draw.on('finish', (id, context) => {
      if (context.action !== 'draw') {
        return
      }
      this._ngZone.run(() => this._onDrawFinished(id))
    })

    draw.start()
    return draw
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

  /**
   * Write `label` into `featureLabelProperty` on every feature in `key`'s
   * group, without re-adding any data. Returns `false` when no feature
   * carries `key`, or when no `featureLabelProperty` is configured — there is
   * then no property to write the label into.
   *
   * Unlike a write through the map's `value`, this does NOT go through
   * `setData()`, so the selection and the viewport are untouched. The
   * repaint and the value update fall out of the data layer's own
   * `setproperty` event, which `_initFeatureChangeListeners()` already turns
   * into a `_labelsOverlay.refresh()` and a `MapValueSource.FeatureChange`
   * emission.
   *
   * It DOES emit a value change, because the label is part of the GeoJSON and
   * the value genuinely changed. Writing that emitted value straight back
   * through the `value` input is inert: `MapValueManagerService.setValue`
   * finds the serialized form identical and returns without emitting.
   */
  public setGroupLabel(key: string, label: string): boolean {
    this._assertInitialized()
    const property = this._labelProperty
    if (!property) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[seam-google-maps] setGroupLabel("${key}") was called with no ` +
            `featureLabelProperty configured, so there is no property to ` +
            `write the label into. Nothing changed.`,
        )
      }
      return false
    }

    const features = this._registry.featuresIn(key)
    if (features.length === 0) {
      return false
    }

    for (const feature of features) {
      // `setProperty` raises `setproperty` whether or not the value differs,
      // and each one costs a full re-serialization of the map's value. A
      // rename typed character by character would pay that per keystroke per
      // feature for writes that change nothing.
      if (feature.getProperty(property) === label) {
        continue
      }
      feature.setProperty(property, label)
    }
    return true
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
    // Arm drawing immediately when edit mode is turned on with nothing
    // selected, so the button press itself is what puts Terra Draw in
    // crosshair mode — matching legacy's button, which calls startDrawing()
    // directly. Without this, the very next click only arms Terra Draw
    // (switching the cursor) without placing a vertex, and a SECOND click is
    // what actually starts the polygon.
    //
    // Not when a group is already selected: the user is there to reshape that
    // group by clicking its vertex/midpoint handles, and arming would make
    // every click place a vertex instead — including the clicks on OTHER
    // groups that let the user switch which one is selected. Also not on the
    // selection merely being CLEARED while already in edit mode (e.g. via
    // Escape, in handleEscape()): that path never calls setEditMode(), so it
    // never reaches this arm — deliberately, since that state has to stay
    // clickable or Escape becomes a trap with no way back to selecting.
    //
    // Goes through startDrawing(), the same path a click on open map already
    // uses, so a Terra Draw recreate still in flight from the PREVIOUS
    // session (stopDrawing() now kicks it off eagerly — see
    // _hasPlacedVertex()) is honoured rather than bypassed — a call that
    // arrives before the new instance's `ready` fires queues itself via
    // _pendingStartDrawing exactly as it would from that click.
    if (enabled && this._selectionSubject.value === null) {
      this.startDrawing()
    }
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
  private _removeFocusedFeature(): void {
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
      this._removeSelection()
    }

    this._applySelection(key, null)
    // Same reasoning as deleteGroup(): a context-menu target naming this
    // group may now reference a removed feature (or a stale feature count),
    // so clear it — but only when it actually named this group.
    if (contextMenuTargetInGroup) {
      this._contextMenuTargetSubject.next(null)
    }
  }

  /**
   * Remove the focused polygon — or, with nothing focused, the selection —
   * unless `canDelete` or a feature's own `editable: false` refuses. A
   * refused delete emits on `deleteBlocked$` and changes nothing.
   */
  public deleteFocusedFeature(): void {
    this._assertInitialized()
    const deletion = this._focusedFeatureDeletion()
    if (deletion !== null && !this._mayDeleteResolved(deletion)) {
      this._deleteBlockedSubject.next(deletion.target)
      return
    }
    this._removeFocusedFeature()
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
      // The physical click that closes a polygon can reach this listener
      // TWICE: once (fast) via Terra Draw's own pointer-driven close
      // detection — which is what runs `_onDrawFinished()` / `stopDrawing()`
      // and flips `isDrawing()` false — and, separately, via Google's own
      // `click` recognition on this map, which this listener is bound to
      // directly. By the time that second delivery arrives (confirmed
      // against the live Storybook: consistently a few milliseconds later,
      // comfortably within one animation frame — see
      // .superpowers/closing-click-report.md), `isDrawing()` already reads
      // false, so the guard just below cannot tell it apart from a fresh
      // click on open map. `_suppressNextMapClick` exists to catch exactly
      // that echo; see its doc comment for why a `domEvent.timeStamp`
      // comparison does NOT work here.
      if (this._suppressNextMapClick) {
        this._suppressNextMapClick = false
        return
      }
      // While drawing, a click on open map is placing a vertex, not a map
      // click — mirrors the data 'click' listener's guard just below. Without
      // this, `onMapClick` in 'grouped' mode calls `startDrawing()`, which
      // calls `setMode('polyline')` again and resets the in-progress path.
      if (this.isDrawing()) {
        return
      }
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

  /**
   * Arm `_suppressNextMapClick`, and guarantee it cannot linger forever if
   * the echo it exists for never arrives — confirmed to be the normal case
   * for most real closes, and true of every synthetic/`play()`-driven draw,
   * per .superpowers/closing-click-report.md. A `setTimeout` would "solve"
   * this by guessing a safe wall-clock delay, which is exactly the kind of
   * timing window this fix is trying to avoid introducing. Two
   * `requestAnimationFrame` callbacks bound the window instead: the observed
   * echo arrives a few milliseconds after `stopDrawing()`, comfortably
   * inside a single frame, so two frames is generous headroom without
   * guessing at a duration — and two real user actions (even fast automated
   * ones) are never going to land within two animation frames of each other,
   * so an unrelated later click is never at risk of being swallowed.
   */
  private _armMapClickSuppression(): void {
    this._suppressNextMapClick = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._suppressNextMapClick = false
      })
    })
  }

  private _onDrawFinished(id: string | number): void {
    // Armed first, before any other work below — including the early return
    // for a draw that produced no usable geometry — since the closing
    // click's late echo (see `_suppressNextMapClick`'s doc comment) can
    // follow either outcome.
    this._armMapClickSuppression()
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
