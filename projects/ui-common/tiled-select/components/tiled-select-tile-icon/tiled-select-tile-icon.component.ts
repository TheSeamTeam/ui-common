import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, HostBinding, Input } from '@angular/core'
import { NgIf, NgTemplateOutlet } from '@angular/common'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { TheSeamTiledSelectTileIconTplDirective } from '../../directives/tiled-select-tile-icon-tpl.directive'
import { TheSeamTiledSelectLayout } from '../../tiled-select.models'

const needToFix = /(MSIE 10)|(Trident.*rv:11\.0)|( Edge\/[\d.]+$)/.test(
  navigator.userAgent,
)

@Component({
  selector: 'seam-tiled-select-tile-icon',
  templateUrl: './tiled-select-tile-icon.component.html',
  styleUrls: ['./tiled-select-tile-icon.component.scss'],
  imports: [NgIf, NgTemplateOutlet, FontAwesomeModule],
})
export class TheSeamTiledSelectTileIconComponent {
  static ngAcceptInputType_grayscaleOnDisable: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput

  readonly needToFix = needToFix

  @HostBinding('class.grid') get _cssClassGrid() {
    return this.layout === 'grid'
  }
  @HostBinding('class.list') get _cssClassList() {
    return this.layout === 'list'
  }

  @Input()
  set layout(value: TheSeamTiledSelectLayout) {
    this._layout = value || 'grid'
  }
  get layout(): TheSeamTiledSelectLayout {
    return this._layout
  }
  private _layout: TheSeamTiledSelectLayout = 'grid'

  @Input() @InputBoolean() grayscaleOnDisable = false
  @Input() @InputBoolean() disabled = false

  @Input() iconClass: string | undefined | null

  @Input()
  get icon(): SeamIcon | undefined | null {
    return this._iconUrl || this._iconObj
  }
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

  @ContentChild(TheSeamTiledSelectTileIconTplDirective, { static: true })
  iconTpl?: TheSeamTiledSelectTileIconTplDirective
}
