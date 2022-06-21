import { AgmMap } from '@agm/core'
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
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
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core'

import { CanDisable, CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'
import { MapManagerService, MAP_CONTROLS_SERVICE } from '@theseam/ui-common/map'
import { fromEvent, of, Subject } from 'rxjs'
import { switchMap, takeUntil, tap } from 'rxjs/operators'

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
  providers: [
    MapManagerService,
    GoogleMapsService,
    // GoogleMapsControlsService,
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsWrapperComponent extends _TheSeamGoogleMapsWrapperMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  private _data: any

  // google maps zoom level
  public zoom = 14

  // initial center position for the map
  public lat = 37.633814
  public lng = -98.570209

  @Input()
  set data(value: any) {
    console.log('data', value)
    this._data = value
    if (this._mapManager.mapReady) {
      this._googleMaps.setData(value)
    }
  }

  @Output() mapReady = new EventEmitter<void>()

  @ViewChild(AgmMap, { static: true }) public agmMap!: AgmMap

  constructor(
    elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
    private readonly _mapManager: MapManagerService,
    private readonly _vcr: ViewContainerRef,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
  ) {
    super(elementRef)
  }

  /** @ignore */
  ngOnInit() {
    fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      tap((event: KeyboardEvent) => {
        // console.log('code', event.code)
        if (event.code === 'Delete') {
          this._googleMaps.deleteSelection()
        } else if (event.code === 'Escape') {
          this._googleMaps.stopDrawing()
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
  }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

  _onMapReady(theMap: google.maps.Map) {
    this._googleMaps.setMap(theMap)
  }
}
