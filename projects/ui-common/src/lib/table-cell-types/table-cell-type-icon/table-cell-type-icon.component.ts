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
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { DatatableComponent } from '@lib/ui-common/datatable'
import { getKnownIcon, SeamIcon, TheSeamIconType } from '@lib/ui-common/icon'
import type { TableCellData } from '@lib/ui-common/table'
import { TableComponent, TABLE_CELL_DATA, TheSeamTableColumn } from '@lib/ui-common/table'

import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'

import { TableCellTypeConfigIcon, TableCellTypeIconConfigAction } from './table-cell-type-icon-config'

export type IconTemplateType = 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button'

@Component({
  selector: 'seam-table-cell-type-icon',
  templateUrl: './table-cell-type-icon.component.html',
  styleUrls: ['./table-cell-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeIconComponent<R = any, V = any> implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input()
  get value() { return this._value }
  set value(value: string | undefined | null) {
    this._value = value
    this._icon = value ? getKnownIcon(value) || value : value
  }
  private _value: string | undefined | null

  @Input()
  get config() { return this._config }
  set config(value: TableCellTypeConfigIcon | undefined | null) {
    this._config = value
    if (value) {
      this.setAction(value.action)
      this._linkClass = this._parseConfigValue(value.linkClass)
      this._iconClass = this._parseConfigValue(value.iconClass)
      this._iconType = value.iconType
      this._title = this._parseConfigValue(value.titleAttr)
      this._srOnly = this._parseConfigValue(value.srOnly)
      this._tooltip = this._parseConfigValue(value.tooltip)
      if (this._tooltip) {
        this._tooltipClass = this._parseConfigValue(value.tooltipClass)
        this._tooltipPlacement = this._parseConfigValue(value.tooltipPlacement) || 'auto'
        this._tooltipContainer = this._parseConfigValue(value.tooltipContainer)
        this._tooltipDisabled = false
      } else {
        this._tooltipDisabled = true
      }
    }
  }
  private _config: TableCellTypeConfigIcon | undefined | null

  _icon: SeamIcon | undefined | null
  _link?: string
  _queryParams?: { [k: string]: any }
  _tplType: IconTemplateType = 'default'
  _title?: string
  _srOnly?: string
  _linkClass?: string
  _iconClass?: string
  _iconType?: TheSeamIconType
  _target?: string
  _tooltip: string
  _tooltipClass: string
  _tooltipPlacement: string
  _tooltipContainer: string
  _tooltipDisabled: boolean = true

  _buttonAction?: TableCellTypeIconConfigAction

  _tableCellData?: TableCellData<'icon', TableCellTypeConfigIcon>
  _row?: any
  _rowIndex?: number
  _colData?: TheSeamTableColumn<'icon', TableCellTypeConfigIcon>

  _download: boolean
  _detectMimeContent: boolean

  @HostBinding('class.datatable-cell-type') _isDatatable = false

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() private _datatable?: DatatableComponent,
    @Optional() private _table?: TableComponent,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'icon', TableCellTypeConfigIcon>
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
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this.config = this._config
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

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  public setAction(configAction?: TableCellTypeIconConfigAction) {
    let newTplType: IconTemplateType = 'default'
    let link: string | undefined
    let download: boolean = false
    let detectMimeContent = false
    let target: string | undefined
    let queryParams: { [l: string]: any } | undefined

    if (configAction) {
      if (configAction.type === 'link') {
        link = this._parseConfigValue(configAction.link)
        if (link !== undefined && link !== null) {
          newTplType = this._parseConfigValue(configAction.asset)
            ? 'link-encrypted'
            : this._parseConfigValue(configAction.external) ? 'link-external' : 'link'
          download = !!this._parseConfigValue(configAction.download)
          detectMimeContent = !!this._parseConfigValue(configAction.detectMimeContent)
          target = this._parseConfigValue(configAction.target)
          queryParams = this._parseConfigValue(configAction.queryParams)
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
    this._target = target
    this._queryParams = queryParams
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
