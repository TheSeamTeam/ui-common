import { AgmMap } from '@agm/core'
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty, NumberInput } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'

import { CanDisable, CanDisableCtor, InputBoolean, InputNumber, mixinDisabled } from '@theseam/ui-common/core'
import { MapManagerService, MapValue, MapValueManagerService, MapValueSource, MAP_CONTROLS_SERVICE } from '@theseam/ui-common/map'
import { fromEvent, of, Subject } from 'rxjs'
import { switchMap, takeUntil, tap } from 'rxjs/operators'

import { MenuComponent } from '@theseam/ui-common/menu'

import { GoogleMapsControlsService } from '../google-maps-controls.service'
import { GoogleMapsService } from '../google-maps.service'

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
    MapManagerService,
    MapValueManagerService,
    GoogleMapsService,
    // GoogleMapsControlsService,
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsWrapperComponent extends _TheSeamGoogleMapsWrapperMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable, ControlValueAccessor {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_zoom: NumberInput

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
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
    private readonly _mapManager: MapManagerService,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _vcr: ViewContainerRef,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
  ) {
    super(elementRef)

    this._focusMonitor.monitor(this._elementRef, true).pipe(
      tap(origin => this._focusOrigin = origin),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this._mapValueManager.valueChanged.pipe(
      tap(changed => {
        if (this._mapManager.mapReady) {
          this._googleMaps.setData(changed.value)
        }
      }),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()
  }

  /** @ignore */
  ngOnInit() {
    console.log('this.featureContextMenu', this.featureContextMenu)
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
            event.preventDefault()
            event.stopPropagation()
          }
        }
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()

    of(this._mapManager.registeredControlDirectives).pipe(
      switchMap(directives => {
        console.log('directives', directives)
        for (const dir of directives) {
          // const componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component)
          // let viewRef = this._vcr.createEmbeddedView(value.templateRef, value.context)
          const viewRef = this._vcr.createEmbeddedView(dir.template, {})
          // viewRef.rootNodes.forEach(rootNode => this.outletElement.appendChild(rootNode));
          viewRef.rootNodes[0].parentElement.removeChild(viewRef.rootNodes[0])
          this._googleMapsControls.addPolygonEditorControls(viewRef.rootNodes[0])

          // Note that we want to detect changes after the nodes have been moved so that
          // any directives inside the portal that are looking at the DOM inside a lifecycle
          // hook won't be invoked too early.
          viewRef.detectChanges()
        }
        return this._mapManager.registeredControlDirectivesChanged.pipe(
          tap(() => {
            const directives2 = this._mapManager.registeredControlDirectives
            console.log('directives2', directives2)
            for (const dir of directives2) {
              // const componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component)
              // let viewRef = this._vcr.createEmbeddedView(value.templateRef, value.context)
              const viewRef = this._vcr.createEmbeddedView(dir.template, {})
              // viewRef.rootNodes.forEach(rootNode => this.outletElement.appendChild(rootNode));
              viewRef.rootNodes[0].parentElement.removeChild(viewRef.rootNodes[0])
              this._googleMapsControls.addPolygonEditorControls(viewRef.rootNodes[0])

              // Note that we want to detect changes after the nodes have been moved so that
              // any directives inside the portal that are looking at the DOM inside a lifecycle
              // hook won't be invoked too early.
              viewRef.detectChanges()
            }
          })
        )
      })
    ).subscribe()

    // const tmpElem = document.createElement('input')
    // tmpElem.

    // console.log('this.agmMapTpl', this.agmMapTpl)
    // this.agmMapTpl.nativeElement.addEventListener('contextmenu', (event: any) => {
    //   console.log('map contextmenu', event)
    // })
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
  }

  _onClickDeleteFeature() {
    this._googleMaps.deleteSelection()
  }
}
