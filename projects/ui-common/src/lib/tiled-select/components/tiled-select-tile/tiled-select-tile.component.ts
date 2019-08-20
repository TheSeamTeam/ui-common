import { animate, animation, keyframes, style, transition, trigger, useAnimation } from '@angular/animations'
import { ChangeDetectorRef, Component, ContentChild, EventEmitter, HostBinding, Input, Output } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons'

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

  faCheckCircle = faCheckCircle

  @HostBinding('@pulse') pulseAnimationState = true

  @Input() layout: TiledSelectLayout = 'grid'

  @Input() name: string
  @Input() label: string
  @Input() icon: string | IconProp
  @Input() disabled = false
  @Input() selected = false

  @Input() tileBackdrop = false
  @Input() selectable = false
  @Input() grayscaleOnDisable = true
  @Input() showLabel = true
  @Input() showSelectedIcon = true

  @Input() iconClass: string

  @Input() overlayTpl: TiledSelectTileOverlayDirective

  @Output() activated = new EventEmitter<any>()

  @ContentChild(TiledSelectTileLabelTplDirective, { static: true }) labelTpl: TiledSelectTileLabelTplDirective

  pulsing = false
  pulsingTimeout: any /* NodeJS.Timeout */

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
    this.pulsingTimeout =
    setTimeout(() => {
      this.pulsing = false
      // this.cdr.detectChanges()
      this.pulsingTimeout = undefined
    }, 750)
  }

}
