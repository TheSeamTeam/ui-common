import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional } from '@angular/core'

import {
  DynamicDatatableCellTypeConfigIcon,
  DynamicDatatableCellTypeConfigIconAction
} from '../../../datatable-dynamic/models/cell-type-config'
import { getKnownIcon, LibIcon } from '../../../icon/index'

import { DATATABLE_CELL_DATA } from '../../datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable-cell-type-selector/datatable-cell.models'

@Component({
  selector: 'seam-datatable-cell-type-icon',
  templateUrl: './datatable-cell-type-icon.component.html',
  styleUrls: ['./datatable-cell-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableCellTypeIconComponent implements OnInit {

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
    }
  }
  private _config: DynamicDatatableCellTypeConfigIcon | undefined | null

  _icon: LibIcon | undefined | null
  _tplType: 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button' = 'default'
  _title?: string
  _srOnly?: string

  constructor(
    @Optional() @Inject(DATATABLE_CELL_DATA) private _data?: IDatatableCellData<any, string>
  ) {
    this.value = this._data && this._data.value
    if (this._data && this._data.colData && (<any>this._data.colData).cellTypeConfig) {
      this.config = (<any>this._data.colData).cellTypeConfig
    }
  }

  ngOnInit() { }

  public setAction(value?: DynamicDatatableCellTypeConfigIconAction) {
    console.log('setAction', value)
    if (value) {
      if (value.type === 'link') {
        this._tplType = value.encrypted ? 'link-encrypted' : 'link'
      }
    }
  }

}
