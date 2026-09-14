import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { combineLatest, fromEvent, Observable, of, Subject } from 'rxjs'
import { catchError, map, skip, takeUntil, tap } from 'rxjs/operators'

import { faCrosshairs, faFileImport } from '@fortawesome/free-solid-svg-icons'
import {
  CanDisable,
  CanDisableCtor,
  InputBoolean,
  InputNumber,
  mixinDisabled,
} from '@theseam/ui-common/core'
import { MenuComponent } from '@theseam/ui-common/menu'

import {
  TheSeamMapFeatureGroup,
  TheSeamMapGroupTarget,
} from '../feature-groups/feature-group'
import { TheSeamGoogleMapsApiLoader } from '../google-maps-api-loader/google-maps-api-loader'
import { GoogleMapsControlsService } from '../google-maps-controls.service'
import { TheSeamGoogleMapsDrawButtonControlComponent } from '../google-maps-draw-button-control/google-maps-draw-button-control.component'
import { TheSeamGoogleMapsRecenterButtonControlComponent } from '../google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsUploadButtonControlComponent } from '../google-maps-upload-button-control/google-maps-upload-button-control.component'
import { GoogleMapsService } from '../google-maps.service'
import { TheSeamMapInteractionMode } from '../interaction/interaction-mode'
import { MapControl, MAP_CONTROLS_SERVICE } from '../map-controls-service'
import {
  MapValue,
  MapValueManagerService,
  MapValueSource,
} from '../map-value-manager.service'
import {
  buildDeleteMenuItems,
  TheSeamMapContextMenuItem,
} from '../context-menu/delete-menu-items'

declare const ngDevMode: boolean | undefined

class TheSeamGoogleMapsComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamGoogleMapsMixinBase: CanDisableCtor &
  typeof TheSeamGoogleMapsComponentBase = mixinDisabled(
  TheSeamGoogleMapsComponentBase,
)

/**
 * A wrapper for googlemap.
 */
@Component({
  selector: 'seam-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
  inputs: ['disabled'],
  providers: [
    MapValueManagerService,
    GoogleMapsService,
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService },
    {
      provide: NG_VALUE_ACCESSOR,

      useExisting: forwardRef(() => TheSeamGoogleMapsComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'seamGoogleMaps',
  standalone: false,
})
export class TheSeamGoogleMapsComponent
  extends _TheSeamGoogleMapsMixinBase
  implements OnInit, OnDestroy, OnChanges, CanDisable, ControlValueAccessor
{
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_zoom: NumberInput
  static ngAcceptInputType_longitude: NumberInput
  static ngAcceptInputType_latitude: NumberInput
  static ngAcceptInputType_fileDropEnabled: BooleanInput
  static ngAcceptInputType_fileUploadControlEnabled: BooleanInput
  static ngAcceptInputType_fullscreenControlEnabled: BooleanInput
  static ngAcceptInputType_reCenterControlEnabled: BooleanInput
  static ngAcceptInputType_mapTypeControlEnabled: BooleanInput
  static ngAcceptInputType_streetViewControlEnabled: BooleanInput
  static ngAcceptInputType_allowDrawingHoleInPolygon: BooleanInput
  static ngAcceptInputType_editingEnabled: BooleanInput
  static ngAcceptInputType_selectedGroupKey: string | null

  private readonly _changeDetectorRef = inject(ChangeDetectorRef)

  private readonly _ngUnsubscribe = new Subject<void>()

  readonly _gmApiLoaded: Observable<boolean>

  readonly _fileUploadControlDef: MapControl = {
    component: TheSeamGoogleMapsUploadButtonControlComponent,
    data: { label: 'Import Geo File', icon: faFileImport },
    // position: 6 /* google.maps.ControlPosition.LEFT_BOTTOM */,
    position: 7, // Below top-right fullscreen button
  }

  readonly _reCenterControlDef: MapControl = {
    component: TheSeamGoogleMapsRecenterButtonControlComponent,
    data: { label: 'Center on Field', icon: faCrosshairs },
    position: 9 /* google.maps.ControlPosition.RIGHT_BOTTOM */,
  }

  readonly _drawControlDef: MapControl = {
    component: TheSeamGoogleMapsDrawButtonControlComponent,
    position: 1 /* google.maps.ControlPosition.TOP_LEFT */,
  }

  private _focusOrigin: FocusOrigin = null

  @Input()
  set value(value: MapValue) {
    this._mapValueManager.setValue(value, MapValueSource.Input)
  }
  get value(): MapValue {
    return this._mapValueManager.value
  }

  @Input()
  set tabIndex(value: number) {
    this._tabIndex = coerceNumberProperty(value)
  }
  get tabIndex(): number {
    return this._tabIndex
  }
  /**
   * Set the tab index to `-1` to allow the root element of the
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  private _tabIndex = -1

  @Input() @InputBoolean() fileDropEnabled = true

  @Input() @InputBoolean() fileUploadControlEnabled = false
  @Input() @InputBoolean() fullscreenControlEnabled = true
  @Input() @InputBoolean() reCenterControlEnabled = true
  @Input() @InputBoolean() mapTypeControlEnabled = true
  @Input() @InputBoolean() streetViewControlEnabled = false

  @Input() @InputBoolean() allowDrawingHoleInPolygon = false

  @Input() @InputBoolean() editingEnabled = true

  @Input()
  set fileImportHandler(value: ((file: File) => void) | undefined | null) {
    this._googleMaps.setFileInputHandler(value)
  }

  @HostBinding('attr.disabled')
  get _attrDisabled() {
    return this.disabled || null
  }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() {
    return this.disabled ? -1 : this.tabIndex || 0
  }

  onChange: any
  onTouched: any

  @Input() @InputNumber() zoom = 14
  @Input() @InputNumber() longitude = -98.570209
  @Input() @InputNumber() latitude = 37.633814

  @Input() padding: number | google.maps.Padding | undefined = 0

  /**
   * Which interaction model the map uses.
   *
   * `'legacy'` is the single-boundary behaviour this component has always had
   * and is the default, so existing consumers are unaffected. `'grouped'`
   * separates selection from geometry editing; see the design doc.
   */
  @Input() interactionMode: TheSeamMapInteractionMode = 'legacy'

  /**
   * Name of the GeoJSON property that groups features into one logical thing,
   * such as a field. Features sharing a value select, style, and edit together.
   * Unset means every feature is its own group.
   */
  @Input() featureGroupProperty: string | undefined

  /** Name of the GeoJSON property holding a group's label text. */
  @Input() featureLabelProperty: string | undefined

  /**
   * Generates the key written to `featureGroupProperty` for a newly drawn
   * group. Consumer-supplied so the format is one the app recognises.
   */
  @Input() newGroupKeyFactory: (() => string) | undefined

  /** Preselect a group. Applied on map-ready and after each external value write. */
  @Input() selectedGroupKey: string | null = null

  /**
   * Vetoes a delete. Return `false` to refuse the target.
   *
   * `target.feature === null` means the whole group is about to cease to
   * exist — every polygon of it is going, however the delete was asked for.
   * A non-null `feature` means one polygon is being removed from a group that
   * survives.
   *
   * **Consulted when no delete is happening.** It decides whether to render
   * the context-menu items, so it runs on every context-menu open. A
   * predicate that logs an attempt or flips state will do so on every
   * right-click. It must also be deterministic for a given target, or the
   * menu and the `Delete` key can disagree about the same target.
   *
   * That is a correctness warning, not a performance one. The context-menu
   * target changes only on a right-click, a delete, and a value write, so
   * this runs a handful of times per gesture.
   *
   * Passing nothing refuses nothing, which is the behaviour this component
   * has always had.
   */
  @Input() canDelete: ((target: TheSeamMapGroupTarget) => boolean) | undefined

  @Output() mapReady = new EventEmitter<google.maps.Map | undefined>()

  @Output() selectionChange = new EventEmitter<TheSeamMapGroupTarget | null>()
  @Output() featureHoverChange =
    new EventEmitter<TheSeamMapGroupTarget | null>()

  /**
   * A delete was attempted and refused — in practice, the `Delete` key, since
   * a refused menu item is never rendered. Emits the target that was refused
   * so the consumer can explain why; only the consumer knows the reason.
   */
  @Output() deleteBlocked = new EventEmitter<TheSeamMapGroupTarget>()

  @ViewChild('featureContextMenu', { static: true, read: MenuComponent })
  public featureContextMenu!: MenuComponent

  _options = {
    mapTypeControl: true,
    mapTypeId: 'hybrid',
    streetViewControl: false,
    fullscreenControl: this.fullscreenControlEnabled,
  }

  readonly _contextMenuItems$: Observable<TheSeamMapContextMenuItem[]>

  private idleListener: google.maps.MapsEventListener | undefined

  constructor(
    readonly elementRef: ElementRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _googleMaps: GoogleMapsService,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _googleMapsApiLoader: TheSeamGoogleMapsApiLoader,
  ) {
    super(elementRef)

    this._focusMonitor
      .monitor(this._elementRef, true)
      .pipe(
        tap((origin) => {
          this._focusOrigin = origin
        }),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this._mapValueManager.valueChanged
      .pipe(
        tap((change) => {
          if (this.onChange) {
            this.onChange(change.value)
          }
          if (this.onTouched) {
            this.onTouched()
          }
        }),
        tap((changed) => {
          if (
            this._googleMaps.mapReady &&
            changed.source !== MapValueSource.FeatureChange
          ) {
            this._googleMaps.setData(changed.value)
            this._applySelectedGroupKey()
          }
        }),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    // `skip(1)` drops the value these BehaviorSubject-backed streams replay on
    // subscribe. An Angular `@Output` should fire when something changes, not
    // when someone starts listening — without this, a consumer binding
    // `(selectionChange)` receives a `null` before the user has interacted at
    // all, which reads as "the selection was cleared" and can wrongly reset a
    // panel or dirty a form on open. The subscription happens in the
    // constructor, when the replayed value is always the initial `null`, so
    // nothing real is ever skipped.
    this._googleMaps.selection$
      .pipe(
        skip(1),
        tap((selection) => this.selectionChange.emit(selection)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this._googleMaps.hover$
      .pipe(
        skip(1),
        tap((hover) => this.featureHoverChange.emit(hover)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    // No `skip(1)` here, unlike `selection$` and `hover$`: `deleteBlocked$` is
    // a plain Subject with no replayed initial value to drop.
    this._googleMaps.deleteBlocked$
      .pipe(
        tap((target) => this.deleteBlocked.emit(target)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()

    this._contextMenuItems$ = combineLatest([
      this._googleMaps.editingEnabled$,
      // The RIGHT-CLICKED feature's group — what "Delete Field" is
      // conceptually acting on, independent of what happens to be selected.
      // See `contextMenuTarget$`'s doc comment.
      this._googleMaps.contextMenuTarget$,
    ]).pipe(
      map(([editingEnabled, target]) =>
        buildDeleteMenuItems({
          mode: this.interactionMode,
          editingEnabled,
          target,
          canDeleteFocusedFeature: () =>
            this._googleMaps.canDeleteFocusedFeature(),
          canDeleteGroup: (key) => this._googleMaps.canDeleteGroup(key),
          canDeleteSelection: () => this._googleMaps.canDeleteSelection(),
          deleteFocusedFeature: () => this._googleMaps.deleteFocusedFeature(),
          deleteGroup: (key) => this._googleMaps.deleteGroup(key),
          deleteSelection: () => this._googleMaps.deleteSelection(),
        }),
      ),
      tap((items) => {
        if (items.length === 0) {
          this._googleMaps.setFeatureContextMenu(null)
        } else {
          this._googleMaps.setFeatureContextMenu(this.featureContextMenu)
        }
      }),
    )

    this._googleMaps.setBaseLatLng(this.latitude, this.longitude)

    this._googleMaps.setPadding(this.padding)

    this._gmApiLoaded = this._googleMapsApiLoader.load().pipe(
      map(() => true),
      catchError(() => of(false)),
    )
  }

  ngOnInit() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        tap((event: KeyboardEvent) => {
          switch (event.code) {
            case 'Delete':
              if (this._googleMaps.isEditingEnabled()) {
                if (this.interactionMode === 'grouped') {
                  this._googleMaps.deleteFocusedFeature()
                } else {
                  this._googleMaps.deleteSelection()
                }
                event.preventDefault()
                event.stopPropagation()
              }
              break
            case 'Escape':
              if (this.interactionMode === 'grouped') {
                this._googleMaps.handleEscape()
              } else {
                // Legacy parity: `handleEscape()`'s cascade also clears a
                // selection, but in legacy mode clicking a feature populates
                // the selection, so that would newly deselect it (and drop
                // its vertex handles) on a key that previously only cancelled
                // a draw. Two apps depend on legacy behaviour unchanged, so
                // keep the narrower pre-existing call here.
                this._googleMaps.stopDrawing()
              }
              event.preventDefault()
              event.stopPropagation()
              break
            case 'ContextMenu':
              this._googleMaps.openContextMenu()
              event.preventDefault()
              event.stopPropagation()
              break
          }
        }),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  ngOnChanges(changes: SimpleChanges): void {
    let updateBase = false
    if (Object.prototype.hasOwnProperty.call(changes, 'latitude')) {
      this.latitude = changes.latitude.currentValue
      updateBase = true
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'longitude')) {
      this.longitude = changes.longitude.currentValue
      updateBase = true
    }
    if (updateBase) {
      this._googleMaps.setBaseLatLng(this.latitude, this.longitude)
    }

    if (
      Object.prototype.hasOwnProperty.call(changes, 'allowDrawingHoleInPolygon')
    ) {
      this._googleMaps.allowDrawingHoleInPolygon(this.allowDrawingHoleInPolygon)
    }

    if (
      Object.prototype.hasOwnProperty.call(changes, 'fullscreenControlEnabled')
    ) {
      const fullscreenControl = coerceBooleanProperty(
        changes.fullscreenControlEnabled.currentValue,
      )
      if (fullscreenControl !== this._options.fullscreenControl) {
        this._options = {
          ...this._options,
          fullscreenControl,
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'editingEnabled')) {
      this._googleMaps.setEditingEnabled(this.editingEnabled)
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'padding')) {
      this._googleMaps.setPadding(this.padding)
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'interactionMode')) {
      this._googleMaps.setInteractionMode(this.interactionMode)
    }

    if (
      Object.prototype.hasOwnProperty.call(changes, 'featureGroupProperty') ||
      Object.prototype.hasOwnProperty.call(changes, 'newGroupKeyFactory')
    ) {
      this._googleMaps.setGroupOptions({
        groupProperty: this.featureGroupProperty,
        newGroupKeyFactory: this.newGroupKeyFactory,
      })
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'selectedGroupKey')) {
      this._applySelectedGroupKey()
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'canDelete')) {
      this._googleMaps.setCanDelete(this.canDelete)
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'featureLabelProperty')) {
      this._googleMaps.setLabelProperty(this.featureLabelProperty)
    }
  }

  private _applySelectedGroupKey(): void {
    if (!this._googleMaps.mapReady) {
      return
    }
    if (this.selectedGroupKey === null) {
      this._googleMaps.clearSelection()
      return
    }
    if (!this._googleMaps.selectGroup(this.selectedGroupKey)) {
      // The named group is not in the current value. Clearing keeps the map
      // and the consumer's expectation from silently diverging.
      this._googleMaps.clearSelection()
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[seam-google-maps] selectedGroupKey "${this.selectedGroupKey}" ` +
            `matches no group in the current value.`,
        )
      }
    }
  }

  writeValue(value: MapValue): void {
    this.value = value
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
    this._changeDetectorRef.markForCheck()
  }

  public fitBounds(
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
    padding?: number | google.maps.Padding,
  ): void {
    this._googleMaps.fitBounds(bounds, padding)
  }

  public getGeoJson(): Promise<object> {
    return this._googleMaps.getGeoJson()
  }

  public hasFocus(): boolean {
    return this._focusOrigin !== null && this._focusOrigin !== undefined
  }

  /** Focuses the button. */
  public focus(): void {
    this._getHostElement().focus()
  }

  private _getHostElement() {
    return this._elementRef.nativeElement
  }

  _onMapReady(theMap: google.maps.Map) {
    this._googleMaps.setMap(theMap)
    this._googleMaps.setData(this._mapValueManager.value)

    // NOTE: The input zoom level was getting reset after this function ran,
    // so putting in this idle listener to wait until the map is fully rendered
    // to set the zoom.
    // Calling reCenterOnFeatures() after setZoom() ensures that maps with pre-drawn shapes
    // will display correctly
    this.idleListener = this._googleMaps.googleMap?.addListener('idle', () => {
      this._googleMaps.googleMap?.setZoom(this.zoom)
      this._googleMaps.reCenterOnFeatures()
      this._googleMaps.setInteractionMode(this.interactionMode)
      this._googleMaps.setGroupOptions({
        groupProperty: this.featureGroupProperty,
        newGroupKeyFactory: this.newGroupKeyFactory,
      })
      this._googleMaps.setLabelProperty(this.featureLabelProperty)
      this._applySelectedGroupKey()
      this.mapReady.emit(this._googleMaps.googleMap)

      this.idleListener?.remove()
    })
  }

  // The service delegates below guard on `mapReady` themselves, the same way
  // `_applySelectedGroupKey()` already does for the declarative
  // `selectedGroupKey` input. Their service-side counterparts call
  // `_assertInitialized()` and throw when the map hasn't finished loading;
  // this component's public surface is documented as non-throwing (an
  // unknown key returns `false` and changes nothing), so "not ready yet"
  // must behave the same way, not worse.

  /** Select a group by key. Returns false when no such group exists. */
  public selectGroup(key: string): boolean {
    if (!this._googleMaps.mapReady) {
      return false
    }
    return this._googleMaps.selectGroup(key)
  }

  public clearSelection(): void {
    if (!this._googleMaps.mapReady) {
      return
    }
    this._googleMaps.clearSelection()
  }

  /** Fit the viewport to a group. Returns false when no such group exists. */
  public fitGroup(
    key: string,
    padding?: number | google.maps.Padding,
  ): boolean {
    if (!this._googleMaps.mapReady) {
      return false
    }
    return this._googleMaps.fitGroup(key, padding)
  }

  /** Pan to a group's centre. Returns false when no such group exists. */
  public panToGroup(key: string): boolean {
    if (!this._googleMaps.mapReady) {
      return false
    }
    return this._googleMaps.panToGroup(key)
  }

  public getGroups(): TheSeamMapFeatureGroup[] {
    if (!this._googleMaps.mapReady) {
      return []
    }
    return this._googleMaps.getGroups()
  }

  /**
   * Set a group's label text in place. Returns false when no such group
   * exists, or when no `featureLabelProperty` is set.
   *
   * Does not clear the selection or re-fit the viewport, so it is safe to
   * call while the user is renaming the very group being displayed.
   */
  public setGroupLabel(key: string, label: string): boolean {
    if (!this._googleMaps.mapReady) {
      return false
    }
    return this._googleMaps.setGroupLabel(key, label)
  }

  public setEditMode(enabled: boolean): void {
    this._googleMaps.setEditMode(enabled)
  }

  public isEditMode(): boolean {
    return this._googleMaps.isEditMode()
  }
}
