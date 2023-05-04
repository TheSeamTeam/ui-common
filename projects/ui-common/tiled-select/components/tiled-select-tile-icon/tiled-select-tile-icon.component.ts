import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, HostBinding, Input } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { TiledSelectTileIconTplDirective } from '../../directives/tiled-select-tile-icon-tpl.directive'
import { TiledSelectLayout } from '../../tiled-select.models'

const needToFix = /(MSIE 10)|(Trident.*rv:11\.0)|( Edge\/[\d.]+$)/.test(navigator.userAgent)

@Component({
  selector: 'seam-tiled-select-tile-icon',
  templateUrl: './tiled-select-tile-icon.component.html',
  styleUrls: ['./tiled-select-tile-icon.component.scss']
})
export class TiledSelectTileIconComponent {
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput

  needToFix = needToFix

  @HostBinding('class.grid') get _cssClassGrid() { return this.layout === 'grid' }
  @HostBinding('class.list') get _cssClassList() { return this.layout === 'list' }

  @Input()
  set layout(value: TiledSelectLayout) { this._layout = value || 'grid' }
  get layout(): TiledSelectLayout { return this._layout }
  private _layout: TiledSelectLayout = 'grid'

  @Input() @InputBoolean() grayscaleOnDisable = false
  @Input() @InputBoolean() disabled = false

  @Input() iconClass: string | undefined | null

  @Input()
  get icon(): SeamIcon | undefined | null { return this._iconUrl || this._iconObj }
  set icon(value: SeamIcon | undefined | null) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }
  }

  public _iconUrl: string | undefined | null
  public _iconObj: IconProp | undefined | null

  @ContentChild(TiledSelectTileIconTplDirective, { static: true }) iconTpl?: TiledSelectTileIconTplDirective

}
