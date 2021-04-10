import { animate, animation, keyframes, style, transition, trigger, useAnimation } from '@angular/animations'
import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectorRef, Component, ContentChild, EventEmitter, HostBinding, Input, Output } from '@angular/core'

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'

import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { TiledSelectTileLabelTplDirective } from '../../directives/tiled-select-tile-label-tpl.directive'
import { TiledSelectTileOverlayDirective } from '../../directives/tiled-select-tile-overlay.directive'
import { TiledSelectLayout } from '../../tiled-select.models'

export const tilePulse = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'scale3d(1, 1, 1)' }),
      style({ transform: 'scale3d({{ scale }}, {{ scale }}, {{ scale }})' }),
      style({ transform: 'scale3d(1, 1, 1)' }),
    ])
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } }
)

export const tileScaleUp = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'scale3d({{ scale }}, {{ scale }}, {{ scale }})' }),
    ])
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } }
)

export const tileScaleDown = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'scale3d(1, 1, 1)' }),
    ])
  ),
  { params: { scale: 1.05, timing: 0.75, delay: 0 } }
)

@Component({
  selector: 'seam-tiled-select-tile',
  templateUrl: './tiled-select-tile.component.html',
  styleUrls: ['./tiled-select-tile.component.scss'],
  animations: [
    trigger('pulse', [
      transition('false => true', [
        useAnimation(tilePulse)
        // useAnimation(tileScaleUp)
      ]),
      // transition('true => false', [
      //   useAnimation(tileScaleDown)
      // ])
    ]),
    // trigger('openClose', [
    //   state('true', style({ height: '*' })),
    //   state('false', style({ height: '0px' })),
    //   transition('false <=> true', animate(500))
    // ])
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiledSelectTileComponent {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_selected: BooleanInput
  static ngAcceptInputType_tileBackdrop: BooleanInput
  static ngAcceptInputType_selectable: BooleanInput
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_showLabel: BooleanInput
  static ngAcceptInputType_showSelectedIcon: BooleanInput

  faCheckCircle = faCheckCircle

  @HostBinding('@pulse') pulseAnimationState = true

  @Input() layout: TiledSelectLayout = 'grid'

  @Input() name: string | undefined | null
  @Input() label: string | undefined | null
  @Input() icon: SeamIcon | undefined | null
  @Input() @InputBoolean() disabled: boolean = false
  @Input() @InputBoolean() selected: boolean = false

  @Input() @InputBoolean() tileBackdrop: boolean = false
  @Input() @InputBoolean() selectable: boolean = false
  @Input() @InputBoolean() grayscaleOnDisable: boolean = true
  @Input() @InputBoolean() showLabel: boolean = true
  @Input() @InputBoolean() showSelectedIcon: boolean = true

  @Input() iconClass: string | undefined | null

  @Input() overlayTpl: TiledSelectTileOverlayDirective | undefined | null

  @Output() activated = new EventEmitter<any>()

  @ContentChild(TiledSelectTileLabelTplDirective, { static: true }) labelTpl?: TiledSelectTileLabelTplDirective

  pulsing = false
  pulsingTimeout: number | undefined

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  onTileClick(event: any) {
    if (!this.selectable) { return }
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
      // this.cdr.detectChanges()
    }

    // console.log('start')
    this.pulsingTimeout = window.setTimeout(() => {
      this.pulsing = false
      // this.cdr.detectChanges()
      this.pulsingTimeout = undefined
    }, 750)
  }

}
