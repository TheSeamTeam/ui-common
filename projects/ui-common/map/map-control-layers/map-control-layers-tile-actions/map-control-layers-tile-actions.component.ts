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

class TheSeamMapControlLayersTileActionsComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersTileActionsMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersTileActionsComponentBase =
    mixinDisabled(TheSeamMapControlLayersTileActionsComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-control-layers-tile-actions',
  templateUrl: './map-control-layers-tile-actions.component.html',
  styleUrls: ['./map-control-layers-tile-actions.component.scss'],
  providers: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersTileActionsComponent extends _TheSeamMapControlLayersTileActionsMixinBase
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
