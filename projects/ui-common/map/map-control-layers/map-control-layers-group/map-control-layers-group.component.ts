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

import { faAngleDown, faEye, faEyeSlash, faLock, faTrash } from '@fortawesome/free-solid-svg-icons'
import { CanDisable, CanDisableCtor, InputBoolean, mixinDisabled } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

class TheSeamMapControlLayersGroupComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersGroupMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersGroupComponentBase =
    mixinDisabled(TheSeamMapControlLayersGroupComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-control-layers-group',
  templateUrl: './map-control-layers-group.component.html',
  styleUrls: ['./map-control-layers-group.component.scss'],
  providers: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersGroupComponent extends _TheSeamMapControlLayersGroupMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_collapsed: BooleanInput

  readonly _collapseIcon: SeamIcon = faAngleDown

  @Input() label: string | null | undefined

  @Input() @InputBoolean() collapsed: BooleanInput

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

  _collapse(): void {
    this.collapsed = !this.collapsed
  }
}
