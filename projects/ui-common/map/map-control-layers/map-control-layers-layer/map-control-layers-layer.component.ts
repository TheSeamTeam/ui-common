import { BooleanInput } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core'

import { CanDisable, CanDisableCtor, mixinDisabled } from '@theseam/ui-common/core'

class TheSeamMapControlLayersLayerComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersLayerMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersLayerComponentBase =
    mixinDisabled(TheSeamMapControlLayersLayerComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-control-layers-layer',
  templateUrl: './map-control-layers-layer.component.html',
  styleUrls: ['./map-control-layers-layer.component.scss'],
  providers: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersLayerComponent extends _TheSeamMapControlLayersLayerMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput

  @Input() label: string | null | undefined

  constructor(
    elementRef: ElementRef,
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
