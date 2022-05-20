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
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'

import { CanDisable, CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'

import { GoogleMapsService } from '../googlemaps.service'

class TheSeamEditControlsComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamEditControlsMixinBase: CanDisableCtor &
  typeof TheSeamEditControlsComponentBase =
    mixinDisabled(TheSeamEditControlsComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-edit-controls',
  templateUrl: './edit-controls.component.html',
  styleUrls: ['./edit-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamEditControlsComponent extends _TheSeamEditControlsMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {

  constructor(
    elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _focusMonitor: FocusMonitor,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService
  ) {
    super(elementRef)
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

}
