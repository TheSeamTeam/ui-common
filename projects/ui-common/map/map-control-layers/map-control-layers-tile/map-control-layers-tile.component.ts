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

class TheSeamMapControlLayersTileComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersTileMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersTileComponentBase =
    mixinDisabled(TheSeamMapControlLayersTileComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-control-layers-tile',
  templateUrl: './map-control-layers-tile.component.html',
  styleUrls: ['./map-control-layers-tile.component.scss'],
  providers: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersTileComponent extends _TheSeamMapControlLayersTileMixinBase
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
