import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import jexl from 'jexl'

import {
  DynamicDatatableCellTypeConfigIcon,
  DynamicDatatableCellTypeConfigIconAction
} from '../../../datatable-dynamic/models/cell-type-config'
import { getKnownIcon, SeamIcon, TheSeamIconType } from '../../../icon/index'

import { DATATABLE_CELL_DATA } from '../../datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable-cell-type-selector/datatable-cell.models'

export type IconTemplateType = 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button'

@Component({
  selector: 'seam-datatable-cell-type-icon',
  templateUrl: './datatable-cell-type-icon.component.html',
  styleUrls: ['./datatable-cell-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableCellTypeIconComponent implements OnInit, OnDestroy {

  @Input()
  get value() { return this._value }
  set value(value: string | undefined | null) {
    this._value = value
    this._icon = value ? getKnownIcon(value) || value : value
  }
  private _value: string | undefined | null

  @Input()
  get config() { return this._config }
  set config(value: DynamicDatatableCellTypeConfigIcon | undefined | null) {
    this._config = value
    if (value) {
      this.setAction(value.action)
      this._linkClass = this._parseConfigValue(value.linkClass)
      this._iconClass = this._parseConfigValue(value.iconClass)
      this._iconType = value.iconType
    }
  }
  private _config: DynamicDatatableCellTypeConfigIcon | undefined | null

  _icon: SeamIcon | undefined | null
  _tplType: IconTemplateType = 'default'
  _title?: string
  _srOnly?: string
  _linkClass?: string
  _iconClass?: string
  _iconType?: TheSeamIconType

  _row?: any
  _rowIndex?: number

  constructor(
    @Optional() @Inject(DATATABLE_CELL_DATA) _data?: IDatatableCellData<any, string>
  ) {

    this._row = _data && _data.row
    this._rowIndex = _data && _data.rowIndex

    this.value = _data && _data.value
    if (_data && _data.colData && (<any>_data.colData).cellTypeConfig) {
      this.config = (<any>_data.colData).cellTypeConfig
    }

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.cellTypeConfig !== this.config) {
              this.config = colData.cellTypeConfig
            } else {
              this.config = undefined
            }
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

  public setAction(configAction?: DynamicDatatableCellTypeConfigIconAction) {
    let newTplType: IconTemplateType = 'default'
    if (configAction) {
      if (configAction.type === 'link') {
        newTplType = configAction.encrypted ? 'link-encrypted' : 'link'
      }
    }

    this._tplType = newTplType
  }

  private _parseConfigValue(val) {
    if (!val) {
      return
    }

    if (typeof val === 'string') {
      return val
    }

    if (val.type === 'jexl') {
      return jexl.evalSync(val.expr, this._row)
    }
  }

}
