import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceNumberProperty, NumberInput } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { fromEvent, Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { AgmMap } from '@agm/core'
import { faCrosshairs, faFileImport } from '@fortawesome/free-solid-svg-icons'
import { CanDisable, CanDisableCtor, InputBoolean, InputNumber, mixinDisabled } from '@theseam/ui-common/core'
import { MenuComponent } from '@theseam/ui-common/menu'

import { GoogleMapsControlsService } from '../google-maps-controls.service'
import { TheSeamGoogleMapsRecenterButtonControlComponent } from '../google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsUploadButtonControlComponent } from '../google-maps-upload-button-control/google-maps-upload-button-control.component'
import { GoogleMapsService } from '../google-maps.service'
import { MapControl, MAP_CONTROLS_SERVICE } from '../map-controls-service'
import { MapValue, MapValueManagerService, MapValueSource } from '../map-value-manager.service'

class TheSeamGoogleMapsWrapperComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamGoogleMapsWrapperMixinBase: CanDisableCtor &
  typeof TheSeamGoogleMapsWrapperComponentBase =
    mixinDisabled(TheSeamGoogleMapsWrapperComponentBase)

/**
 * A wrapper for googlemap.
 */
@Component({
  selector: 'seam-google-maps-wrapper',
  templateUrl: './google-maps-wrapper.component.html',
  styleUrls: ['./google-maps-wrapper.component.scss'],
  inputs: [
    'disabled'
  ],
  providers: [
    MapValueManagerService,
    GoogleMapsService,
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService },
    {
      provide: NG_VALUE_ACCESSOR,
      // tslint:disable-next-line: no-use-before-declare
      useExisting: forwardRef(() => TheSeamGoogleMapsWrapperComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsWrapperComponent extends _TheSeamGoogleMapsWrapperMixinBase
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, CanDisable, ControlValueAccessor {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_zoom: NumberInput
  static ngAcceptInputType_fileDropEnabled: BooleanInput
  static ngAcceptInputType_fileUploadControlEnabled: BooleanInput
  static ngAcceptInputType_fullscreenControlEnabled: BooleanInput
  static ngAcceptInputType_reCenterControlEnabled: BooleanInput
  static ngAcceptInputType_mapTypeControlEnabled: BooleanInput
  static ngAcceptInputType_streetViewControlEnabled: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  readonly _fileUploadControlDef: MapControl = {
    component: TheSeamGoogleMapsUploadButtonControlComponent,
    data: { label: 'Import Geo File', icon: faFileImport },
    position: 6 /* google.maps.ControlPosition.LEFT_BOTTOM */,
  }

  readonly _reCenterControlDef: MapControl = {
    component: TheSeamGoogleMapsRecenterButtonControlComponent,
    data: { label: 'Center on Field', icon: faCrosshairs },
    position: 9 /* google.maps.ControlPosition.RIGHT_BOTTOM */,
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
  set tabIndex(value: number) { this._tabIndex = coerceNumberProperty(value) }
  get tabIndex(): number { return this._tabIndex }
  /**
   * Set the tab index to `-1` to allow the root element of the
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  private _tabIndex = -1

  @Input() @InputBoolean() fileDropEnabled: BooleanInput = true

  @Input() @InputBoolean() fileUploadControlEnabled: BooleanInput = true
  @Input() @InputBoolean() fullscreenControlEnabled: BooleanInput = true
  @Input() @InputBoolean() reCenterControlEnabled: BooleanInput = true
  @Input() @InputBoolean() mapTypeControlEnabled: BooleanInput = true
  @Input() @InputBoolean() streetViewControlEnabled: BooleanInput = false

  @HostBinding('attr.disabled')
  get _attrDisabled() { return this.disabled || null }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this.disabled ? -1 : (this.tabIndex || 0) }

  onChange: any
  onTouched: any

  @Input() @InputNumber() zoom: number = 14
  @Input() @InputNumber() longitude: number = -98.570209
  @Input() @InputNumber() latitude: number = 37.633814

  @Output() mapReady = new EventEmitter<void>()

  @ViewChild(AgmMap, { static: true }) public agmMap!: AgmMap
  @ViewChild('featureContextMenu', { static: true, read: MenuComponent }) public featureContextMenu!: MenuComponent

  @ViewChild(AgmMap, { static: true, read: ElementRef }) public agmMapTpl!: ElementRef<HTMLElement>

  constructor(
    elementRef: ElementRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _googleMaps: GoogleMapsService,
    private readonly _mapValueManager: MapValueManagerService,
  ) {
    super(elementRef)

    this._focusMonitor.monitor(this._elementRef, true).pipe(
      tap(origin => this._focusOrigin = origin),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this._mapValueManager.valueChanged.pipe(
      tap(change => {
        if (this.onChange) { this.onChange(change.value) }
        if (this.onTouched) { this.onTouched() }
      }),
      tap(changed => {
        if (this._googleMaps.mapReady && changed.source !== MapValueSource.FeatureChange) {
          this._googleMaps.setData(changed.value)
        }
      }),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this._googleMaps.setBaseLatLng(this.latitude, this.longitude)
  }

  /** @ignore */
  ngOnInit() {
    this._googleMaps.setFeatureContextMenu(this.featureContextMenu)

    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      tap((event: KeyboardEvent) => {
        switch (event.code) {
          case 'Delete': this._googleMaps.deleteSelection()
          case 'Escape': this._googleMaps.stopDrawing()
          case 'ContextMenu': this._googleMaps.openContextMenu()
        }
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  /** @ignore */
  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  /** @ignore */
  ngAfterViewInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    let updateBase = false
    if (changes.hasOwnProperty('latitude')) {
      this.latitude = changes['latitude'].currentValue
      updateBase = true
    }
    if (changes.hasOwnProperty('longitude')) {
      this.latitude = changes['longitude'].currentValue
      updateBase = true
    }
    if (updateBase) {
      this._googleMaps.setBaseLatLng(this.latitude, this.longitude)
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
  }

  _onClickDeleteFeature() {
    this._googleMaps.deleteSelection()
  }
}
