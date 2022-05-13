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
  ViewChild,
} from '@angular/core'

import {
  CanDisable,
  CanDisableCtor,
  HasTabIndex,
  HasTabIndexCtor,
  InputBoolean,
  InputNumber,
  mixinDisabled,
  mixinTabIndex,
} from '@theseam/ui-common/core'

class TheSeamMapComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapMixinBase: HasTabIndexCtor & CanDisableCtor &
  typeof TheSeamMapComponentBase =
    mixinTabIndex(mixinDisabled(TheSeamMapComponentBase))

/**
 * A map.
 */
@Component({
  selector: 'seam-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  exportAs: 'seamMap',
  host: {
    '[attr.tabindex]': 'null',
  },
  providers: [ ],
  inputs: [ 'tabIndex' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapComponent extends _TheSeamMapMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable, HasTabIndex {

  constructor(
    elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _ngZone: NgZone,
    @Attribute('tabindex') tabIndex: string
  ) {
    super(elementRef)

    this.tabIndex = parseInt(tabIndex, 10) || 0
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

}
