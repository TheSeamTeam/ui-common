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

import { DatatableComponent } from '@theseam/ui-common/datatable'
import { TableComponent } from '@theseam/ui-common/table'
import { TableCellTypesHelpersService, TABLE_CELL_DATA } from '@theseam/ui-common/table-cell-type'
import type { TableCellData, TheSeamTableColumn } from '@theseam/ui-common/table-cell-type'

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

  private readonly _ngUnsubscribe = new Subject<void>()

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
      this.setConfig(value)
    }
  }
  private _config: TableCellTypeConfigString | undefined | null

  _tplType: StringTemplateType = 'default'
  _link?: string
  _title?: string
  _queryParams?: { [k: string]: any }

  _style?: string
  _class?: string

  _buttonAction?: TableCellTypeStringConfigAction

  _tableCellData?: TableCellData<'string', TableCellTypeConfigString>
  _row?: any
  _rowIndex?: number
  _colData?: TheSeamTableColumn<'string', TableCellTypeConfigString>

  _download?: boolean
  _detectMimeContent?: boolean

  @Input()
  set title(value: string | undefined) { this._title = value }
  get title(): string | undefined { return this._title }

  @HostBinding('attr.title') get _titleAttr() { return this.title || this.value }

  @Input()
  set style(value: string | undefined) { this._style = value }
  get style(): string | undefined { return this._style }

  @HostBinding('attr.style') get _styleAttr() { return this.style }

  @Input()
  set classAttr(value: string | undefined) { this._class = value }
  get classAttr(): string | undefined { return this._class }

  @HostBinding('class') get _classAttr() { return this.classAttr }

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
    if (_data && _data.colData && (_data.colData as any).cellTypeConfig) {
      this.config = (_data.colData as any).cellTypeConfig
    }
  }

  ngOnInit() {
    const _data = this._tableData
    if (_data) {
      _data.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (Object.prototype.hasOwnProperty.call(v.changes, 'value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (Object.prototype.hasOwnProperty.call(v.changes, 'colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.cellTypeConfig !== this.config) {
              this.config = colData.cellTypeConfig
            } else {
              this.config = undefined
            }
            this._cdf.markForCheck()
          } else {
            if (Object.prototype.hasOwnProperty.call(v.changes, 'row')) {
              // eslint-disable-next-line no-self-assign
              this.config = this.config
              this._cdf.markForCheck()
            }
          }
        })
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  public setAction(configAction?: TableCellTypeStringConfigAction) {
    let newTplType: StringTemplateType = 'default'
    let link: string | undefined
    let download = false
    let detectMimeContent = false
    let queryParams: { [k: string]: any } | undefined

    if (configAction) {
      if (configAction.type === 'link') {
        link = this._parseConfigValue(configAction.link)
        if (link !== undefined && link !== null) {
          newTplType = this._parseConfigValue(configAction.asset) ? 'link-encrypted' : 'link'
          download = !!this._parseConfigValue(configAction.download)
          detectMimeContent = !!this._parseConfigValue(configAction.detectMimeContent)
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
    this._queryParams = queryParams
  }

  public setConfig(config?: TableCellTypeConfigString): void {
    if (!config) { return }

    const title = this._parseConfigValue(config.titleAttr)
    if (title) {
      this.title = title
    }

    const style = this._parseConfigValue(config.styleAttr)
    if (style) {
      this.style = style
    }

    const classAttr = this._parseConfigValue(config.classAttr)
    if (classAttr) {
      this.classAttr = classAttr
    }

    this.setAction(config.action)
  }

  private _parseConfigValue(val: any) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, this._tableCellData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  _doButtonAction() {
    if (this._buttonAction && this._buttonAction.type === 'modal') {
      const contextFn = () => this._tableCellTypeHelpers.getValueContext(this.value, this._tableCellData)
      this._tableCellTypeHelpers.handleModalAction(this._buttonAction, contextFn)
        .subscribe(
          r => {},
          // eslint-disable-next-line no-console
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
