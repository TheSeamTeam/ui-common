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

class TheSeamMapControlLayersTileActionComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersTileActionMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersTileActionComponentBase =
    mixinDisabled(TheSeamMapControlLayersTileActionComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-control-layers-tile-action',
  templateUrl: './map-control-layers-tile-action.component.html',
  styleUrls: ['./map-control-layers-tile-action.component.scss'],
  providers: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersTileActionComponent extends _TheSeamMapControlLayersTileActionMixinBase
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
