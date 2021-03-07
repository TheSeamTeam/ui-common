import { Component, ContentChild, HostBinding, Input, OnInit } from '@angular/core'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { SeamIcon } from '@lib/ui-common/icon'

import { TiledSelectTileIconTplDirective } from '../../directives/tiled-select-tile-icon-tpl.directive'

const needToFix = /(MSIE 10)|(Trident.*rv:11\.0)|( Edge\/[\d\.]+$)/.test(navigator.userAgent)

@Component({
  selector: 'seam-tiled-select-tile-icon',
  templateUrl: './tiled-select-tile-icon.component.html',
  styleUrls: ['./tiled-select-tile-icon.component.scss']
})
export class TiledSelectTileIconComponent implements OnInit {

  needToFix = needToFix

  @HostBinding('class.grid') get _cssClassGrid() { return this.layout === 'grid' }
  @HostBinding('class.list') get _cssClassList() { return this.layout === 'list' }

  @Input() layout: 'grid' | 'list' = 'grid'
  @Input() grayscaleOnDisable = false
  @Input() disabled = false

  @Input() iconClass: string

  @Input()
  get icon(): SeamIcon | undefined { return this._iconUrl || this._iconObj }
  set icon(value: SeamIcon | undefined) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }
  }

  public _iconUrl: string | undefined
  public _iconObj: IconProp | undefined

  @ContentChild(TiledSelectTileIconTplDirective, { static: true }) iconTpl: TiledSelectTileIconTplDirective

  constructor() { }

  ngOnInit() { }

}
