import {
  animate,
  animation,
  keyframes,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations'
import { BooleanInput } from '@angular/cdk/coercion'
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  Output,
} from '@angular/core'
import { NgIf, NgTemplateOutlet } from '@angular/common'

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { TheSeamTiledSelectTileLabelTplDirective } from '../../directives/tiled-select-tile-label-tpl.directive'
import { TheSeamTiledSelectTileOverlayDirective } from '../../directives/tiled-select-tile-overlay.directive'
import { TheSeamTiledSelectLayout } from '../../tiled-select.models'
import { TheSeamTiledSelectTileIconComponent } from '../tiled-select-tile-icon/tiled-select-tile-icon.component'

export const tilePulse = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'scale3d(1, 1, 1)' }),
      style({ transform: 'scale3d({{ scale }}, {{ scale }}, {{ scale }})' }),
      style({ transform: 'scale3d(1, 1, 1)' }),
    ]),
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } },
)

export const tileScaleUp = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'scale3d({{ scale }}, {{ scale }}, {{ scale }})' }),
    ]),
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } },
)

export const tileScaleDown = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([style({ transform: 'scale3d(1, 1, 1)' })]),
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } },
)

@Component({
  selector: 'seam-tiled-select-tile',
  templateUrl: './tiled-select-tile.component.html',
  styleUrls: ['./tiled-select-tile.component.scss'],
  animations: [
    trigger('pulse', [
      transition('false => true', [
        useAnimation(tilePulse),
        // useAnimation(tileScaleUp)
      ]),
      // transition('true => false', [
      //   useAnimation(tileScaleDown)
      // ]),
    ]),
    // trigger('openClose', [
    //   state('true', style({ height: '*' })),
    //   state('false', style({ height: '0px' })),
    //   transition('false <=> true', animate(500))
    // ]),
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgTemplateOutlet,
    FontAwesomeModule,
    TheSeamTiledSelectTileIconComponent,
  ],
})
export class TheSeamTiledSelectTileComponent {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_selected: BooleanInput
  static ngAcceptInputType_tileBackdrop: BooleanInput
  static ngAcceptInputType_selectable: BooleanInput
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_showLabel: BooleanInput
  static ngAcceptInputType_showSelectedIcon: BooleanInput

  private readonly _cdr = inject(ChangeDetectorRef)

  readonly faCheckCircle = faCheckCircle

  @HostBinding('@pulse') pulseAnimationState = true
  @HostBinding('attr.data-tile-name') get _tileNameAttr() {
    return this.name
  }

  @Input() layout: TheSeamTiledSelectLayout = 'grid'

  @Input() name: string | undefined | null
  @Input() label: string | undefined | null
  @Input() icon: SeamIcon | undefined | null
  @Input() @InputBoolean() disabled = false
  @Input() @InputBoolean() selected = false

  @Input() @InputBoolean() tileBackdrop = false
  @Input() @InputBoolean() selectable = false
  @Input() @InputBoolean() grayscaleOnDisable = true
  @Input() @InputBoolean() showLabel = true
  @Input() @InputBoolean() showSelectedIcon = true

  @Input() iconClass: string | undefined | null

  @Input() overlayTpl: TheSeamTiledSelectTileOverlayDirective | undefined | null

  @Output() readonly activated = new EventEmitter<any>()

  @ContentChild(TheSeamTiledSelectTileLabelTplDirective, { static: true })
  labelTpl?: TheSeamTiledSelectTileLabelTplDirective

  pulsing = false
  pulsingTimeout: number | undefined

  onTileClick(event: any) {
    if (!this.selectable) {
      return
    }
    this.activated.emit(event)

    // this.pulsing = true
    // setTimeout(() => {
    //   this.pulsing = false
    // }, 750)
  }

  mDown() {
    if (this.pulsingTimeout) {
      clearTimeout(this.pulsingTimeout)
    }

    if (!this.pulsing) {
      this.pulsing = true
      // this._cdr.detectChanges()
    }

    // console.log('start')
    this.pulsingTimeout = window.setTimeout(() => {
      this.pulsing = false
      // this._cdr.detectChanges()
      this.pulsingTimeout = undefined
    }, 750)
  }
}
