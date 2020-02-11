import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import {
  DynamicDatatableCellActionModal,
  DynamicDatatableCellTypeConfigIcon,
  DynamicDatatableCellTypeConfigIconAction
} from '../../datatable-dynamic/index'
import { getKnownIcon, SeamIcon, TheSeamIconType } from '../../icon/index'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'
import { ITheSeamTableColumn } from '../../table/table-column'
import { TableComponent } from '../../table/table/table.component'

import { DatatableComponent, THESEAM_DATATABLE } from '../../datatable/datatable/datatable.component'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'

export type IconTemplateType = 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button'

@Component({
  selector: 'seam-table-cell-type-icon',
  templateUrl: './table-cell-type-icon.component.html',
  styleUrls: ['./table-cell-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeIconComponent<R = any, V = any> implements OnInit, OnDestroy {

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
  _link?: string
  _tplType: IconTemplateType = 'default'
  _title?: string
  _srOnly?: string
  _linkClass?: string
  _iconClass?: string
  _iconType?: TheSeamIconType

  _buttonAction?: DynamicDatatableCellTypeConfigIconAction

  _tableCellData?: ITableCellData<any, string>
  _row?: any
  _rowIndex?: number
  _colData?: ITheSeamTableColumn<R>

  _download: boolean
  _detectMimeContent: boolean

  @HostBinding('class.datatable-cell-type') _isDatatable = false

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() private _datatable?: DatatableComponent,
    @Optional() private _table?: TableComponent,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: ITableCellData<any, string>
  ) {
    if (_datatable) {
      this._isDatatable = true
      // console.log('isDataTable')
    }
    // if (_table) {
    //   console.log('isTable')
    // }

    const _data = _tableData
    this._tableCellData = _tableData

    this._row = _data && _data.row
    this._rowIndex = _data && _data.rowIndex

    this.value = _data && _data.value
    this._colData = _data && _data.colData
    if (_data && _data.colData && (<any>_data.colData).cellTypeConfig) {
      this.config = (<any>_data.colData).cellTypeConfig
    }

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.cellTypeConfig !== this.config) {
              this.config = colData.cellTypeConfig
            } else {
              this.config = undefined
            }
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

  public setAction(configAction?: DynamicDatatableCellTypeConfigIconAction) {
    let newTplType: IconTemplateType = 'default'
    let link: string | undefined
    let download: boolean = false
    let detectMimeContent = false

    if (configAction) {
      if (configAction.type === 'link') {
        link = this._parseConfigValue(configAction.link)
        if (link !== undefined && link !== null) {
          newTplType = configAction.encrypted ? 'link-encrypted' : 'link'
          download = configAction.download ? true : false
          detectMimeContent = configAction.detectMimeContent ? true : false
        }
      } else if (configAction.type === 'modal') {
        newTplType = 'button'
        this._buttonAction = configAction
      }
    }

    this._tplType = newTplType
    this._link = link
    this._download = download
    this._detectMimeContent = detectMimeContent
  }

  private _parseConfigValue(val) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, this._tableCellData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  _doButtonAction() {
    if (this._buttonAction && this._buttonAction.type === 'modal') {
      const contextFn = () => this._tableCellTypeHelpers.getValueContext(this.value, this._tableCellData)
      this._tableCellTypeHelpers.handleModalAction(this._buttonAction, contextFn)
        .subscribe(
          r => {},
          err => console.error(err),
          () => this._actionRefreshRequest()
        )
    }
  }

  private _actionRefreshRequest() {
    if (this._datatable) {
      this._datatable.triggerActionRefreshRequest()
    } else if (this._table) {
      this._table.triggerActionRefreshRequest()
    }
  }

}
