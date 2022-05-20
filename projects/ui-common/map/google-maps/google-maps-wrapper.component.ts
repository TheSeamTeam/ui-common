import { AgmMap } from '@agm/core'
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'

import { CanDisable, CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'
import { TheSeamEditControlsWrapperComponent } from '../edit-controls-wrapper/edit-controls-wrapper.component'
import { GoogleMapsControlsService } from '../google-maps-controls.service'

import { GoogleMapsService } from '../googlemaps.service'
import { MAP_CONTROLS_SERVICE } from '../map-controls-service'

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
    GoogleMapsService,
    // GoogleMapsControlsService,
    { provide: MAP_CONTROLS_SERVICE, useClass: GoogleMapsControlsService }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsWrapperComponent extends _TheSeamGoogleMapsWrapperMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput

  // google maps zoom level
  public zoom = 14

  // initial center position for the map
  public lat = 37.633814
  public lng = -98.570209

  // @Input() @InputBoolean()
  // set enablePolygonEditorControls(value: boolean) {
  //   const controlsElement = this.editControlsWrapper.templateRef.elementRef.nativeElement
  //   if (value) {
  //     this._googleMapsControls.addPolygonEditorControls(controlsElement)
  //   } else {
  //     this._googleMapsControls.removePolygonEditorControls()
  //   }
  // }

  @ViewChild(AgmMap, { static: true }) public agmMap!: AgmMap
  @ViewChild(TheSeamEditControlsWrapperComponent, { static: true }) public editControlsWrapper!: TheSeamEditControlsWrapperComponent

  constructor(
    elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
  ) {
    super(elementRef)
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

  _onMapReady(theMap: google.maps.Map) {
    this._googleMaps.setMap(theMap)
  }
}
