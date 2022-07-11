import { AgmMap } from '@agm/core'
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceNumberProperty, NumberInput } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'
import { fromEvent, Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { CanDisable, CanDisableCtor, InputBoolean, InputNumber, mixinDisabled } from '@theseam/ui-common/core'

import { faCrosshairs, faFileImport } from '@fortawesome/free-solid-svg-icons'
import { MenuComponent } from '@theseam/ui-common/menu'

import { GoogleMapsControlsService } from '../google-maps-controls.service'
import { TheSeamGoogleMapsRecenterButtonControlComponent } from '../google-maps-recenter-button-control/google-maps-recenter-button-control.component'
import { TheSeamGoogleMapsUploadButtonControlComponent } from '../google-maps-upload-button-control/google-maps-upload-button-control.component'
import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROLS_SERVICE } from '../map-controls-service'
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
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsWrapperComponent extends _TheSeamGoogleMapsWrapperMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable, ControlValueAccessor {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_zoom: NumberInput
  static ngAcceptInputType_fileDropEnabled: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  private _focusOrigin: FocusOrigin = null

  @Input()
  set value(value: MapValue) {
    const changed = this._mapValueManager.setValue(value, MapValueSource.Input)
    if (changed) {
      if (this.onChange) { this.onChange(value) }
      if (this.onTouched) { this.onTouched() }
    }
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
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
    private readonly _mapValueManager: MapValueManagerService,
  ) {
    super(elementRef)

    this._focusMonitor.monitor(this._elementRef, true).pipe(
      tap(origin => this._focusOrigin = origin),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this._mapValueManager.valueChanged.pipe(
      tap(changed => {
        console.log('valueChanged', changed.source, changed.value)
        if (this._googleMaps.mapReady && changed.source !== MapValueSource.FeatureChange) {
          this._googleMaps.setData(changed.value)
        }
      }),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()
  }

  /** @ignore */
  ngOnInit() {
    this._googleMaps.setFeatureContextMenu(this.featureContextMenu)

    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      tap((event: KeyboardEvent) => {
        console.log('code', event.code)
        if (event.code === 'Delete') {
          this._googleMaps.deleteSelection()
        } else if (event.code === 'Escape') {
          this._googleMaps.stopDrawing()
        } else if (event.code === 'ContextMenu') {
          if (this._googleMaps.hasSelectedFeature()) {
            this._googleMaps.openContextMenu()
          }
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

    this._googleMapsControls.add({
      component: TheSeamGoogleMapsUploadButtonControlComponent,
      data: { label: 'Import Geo File', icon: faFileImport },
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    })

    this._googleMapsControls.add({
      component: TheSeamGoogleMapsRecenterButtonControlComponent,
      data: { label: 'Center on Field', icon: faCrosshairs },
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    })
  }

  _onClickDeleteFeature() {
    this._googleMaps.deleteSelection()
  }
}
