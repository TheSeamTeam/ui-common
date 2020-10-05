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

import { DatatableComponent } from '../../datatable/datatable/datatable.component'
import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import type { TableCellData } from '../../table/table-cell.models'
import { TheSeamTableColumn } from '../../table/table-column'
import { TableComponent } from '../../table/table/table.component'

import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'

import { TableCellTypeConfigString, TableCellTypeStringConfigAction } from './table-cell-type-string-config'

export type StringTemplateType = 'default' | 'link' | 'link-external' | 'link-encrypted' | 'button'

@Component({
  selector: 'seam-table-cell-type-string',
  templateUrl: './table-cell-type-string.component.html',
  styleUrls: ['./table-cell-type-string.component.scss'],
  host: { },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeStringComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input()
  get value() { return this._value }
  set value(val: string | null | undefined) {
    this._value = val
    // TODO: This is temporary to test the feature and will be fixed when the
    // dynamic column data is fixed. The plan is to add a config toggle to
    // always enable and depending on performance it could try to decide on its
    // own based on content size.
    if (this.value && this.value.length > 30) {
      this.canPopover = true
    }
  }
  _value: string | null | undefined

  @Input()
  get config() { return this._config }
  set config(value: TableCellTypeConfigString | undefined | null) {
    this._config = value
    if (value) {
      this.setAction(value.action)
    }
  }
  private _config: TableCellTypeConfigString | undefined | null

  _tplType: StringTemplateType = 'default'
  _link?: string
  _title?: string

  _buttonAction?: TableCellTypeStringConfigAction

  _tableCellData?: TableCellData<'string', TableCellTypeConfigString>
  _row?: any
  _rowIndex?: number
  _colData?: TheSeamTableColumn<'string', TableCellTypeConfigString>

  _download: boolean
  _detectMimeContent: boolean

  @Input()
  set title(value: string | undefined) { this.title = value }
  get title(): string | undefined { return this._title }

  @HostBinding('attr.title') get _titleAttr() { return this.title || this.value }

  canPopover = false

  constructor(
    private readonly _cdf: ChangeDetectorRef,
    private readonly _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() private _datatable?: DatatableComponent,
    @Optional() private _table?: TableComponent,
    @Optional() @Inject(TABLE_CELL_DATA) readonly _tableData?: TableCellData<'string', TableCellTypeConfigString>
  ) {
    const _data = _tableData
    this._tableCellData = _tableData

    this._row = _data && _data.row
    this._rowIndex = _data && _data.rowIndex

    this.value = _data && _data.value
    this._colData = _data && _data.colData
    if (_data && _data.colData && (<any>_data.colData).cellTypeConfig) {
      this.config = (<any>_data.colData).cellTypeConfig
    }
  }

  ngOnInit() {
    const _data = this._tableData
    if (_data) {
      _data.changed
        .pipe(takeUntil(this._ngUnsubscribe))
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

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  public setAction(configAction?: TableCellTypeStringConfigAction) {
    let newTplType: StringTemplateType = 'default'
    let link: string | undefined
    let download: boolean = false
    let detectMimeContent = false

    if (configAction) {
      if (configAction.type === 'link') {
        link = this._parseConfigValue(configAction.link)
        if (link !== undefined && link !== null) {
          newTplType = this._parseConfigValue(configAction.asset) ? 'link-encrypted' : 'link'
          download = !!this._parseConfigValue(configAction.download)
          detectMimeContent = !!this._parseConfigValue(configAction.detectMimeContent)
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
