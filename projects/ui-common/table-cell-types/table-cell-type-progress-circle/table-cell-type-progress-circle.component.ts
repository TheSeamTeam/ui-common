import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
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

import { IconTemplateType } from './../table-cell-type-icon/table-cell-type-icon.component'
import { TableCellTypeConfigProgressCircle, TableCellTypeProgressCircleConfigAction } from './table-cell-type-progress-circle-config'

@Component({
  selector: 'seam-table-cell-type-progress-circle',
  templateUrl: './table-cell-type-progress-circle.component.html',
  styleUrls: ['./table-cell-type-progress-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeProgressCircleComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input() value: number | null | undefined

  _tableCellData?: TableCellData<'progress-circle', TableCellTypeConfigProgressCircle>
  colData?: TheSeamTableColumn<'progress-circle', TableCellTypeConfigProgressCircle>

  fillBackground: boolean = false
  showText: boolean = false
  hiddenOnEmpty: boolean = true
  pending: boolean = false
  tooltip?: string
  tooltipClass?: string
  tooltipPlacement?: string
  tooltipContainer?: string
  _tooltipDisabled: boolean = false

  _title?: string
  _srOnly?: string

  _link?: string
  _linkClass = '' // TODO: Decide if this makes sense
  _tplType: IconTemplateType = 'default'
  _target?: string
  _queryParams?: { [k: string]: any }

  _buttonAction?: TableCellTypeProgressCircleConfigAction

  _download?: boolean
  _detectMimeContent?: boolean

  private _config: TableCellTypeConfigProgressCircle | undefined | null

  @HostBinding('class.datatable-cell-type') _isDatatable = false

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() private _datatable?: DatatableComponent,
    @Optional() private _table?: TableComponent,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'progress-circle', TableCellTypeConfigProgressCircle>
  ) {
    if (_datatable) {
      this._isDatatable = true
    }

    const tableData = _tableData
    this._tableCellData = _tableData

    this.value = tableData && coerceNumberProperty(tableData.value)
    this.colData = tableData && tableData.colData

    if (this.colData && this.colData.cellTypeConfig) {
      this._setCellTypeConfigProps(this.colData.cellTypeConfig)
    }

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = coerceNumberProperty(v.changes.value.currentValue)
            if (this._config) {
              this._setCellTypeConfigProps(this._config)
            }
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            this.colData = v.changes.colData.currentValue
            if (this.colData && this.colData.cellTypeConfig) {
              this._setCellTypeConfigProps(this.colData.cellTypeConfig)
            }
            this._cdf.markForCheck()
          } else {
            if (v.changes.hasOwnProperty('row')) {
              if (this.colData?.cellTypeConfig) {
                this._setCellTypeConfigProps(this.colData.cellTypeConfig)
                this._cdf.markForCheck()
              }
            }
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  private _parseConfigValue(val: any) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, this._tableCellData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  public setAction(configAction?: TableCellTypeProgressCircleConfigAction) {
    let newTplType: IconTemplateType = 'default'
    let link: string | undefined
    let download: boolean = false
    let detectMimeContent = false
    let target: string | undefined
    let queryParams: { [k: string]: any } | undefined

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

  private _setCellTypeConfigProps(config: TableCellTypeConfigProgressCircle): void {
    this._config = config
    this.setAction(config.action)
    this.fillBackground = coerceBooleanProperty(this._parseConfigValue(config.fillBackground))
    this.showText = coerceBooleanProperty(this._parseConfigValue(config.showText))
    this.hiddenOnEmpty = coerceBooleanProperty(this._parseConfigValue(config.hiddenOnEmpty))
    this.pending = coerceBooleanProperty(this._parseConfigValue(config.pending))
    this.tooltip = this._parseConfigValue(config.tooltip)

    this.tooltip = this._parseConfigValue(config.tooltip)
    if (this.tooltip) {
      this.tooltipClass = this._parseConfigValue(config.tooltipClass)
      this.tooltipPlacement = this._parseConfigValue(config.tooltipPlacement) || 'auto'
      this.tooltipContainer = this._parseConfigValue(config.tooltipContainer)
      this._tooltipDisabled = false
    } else {
      this._tooltipDisabled = true
    }

    this._title = this._parseConfigValue(config.titleAttr)
    this._srOnly = this._parseConfigValue(config.srOnly)
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
