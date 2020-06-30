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
import { DatatableComponent } from '../../datatable/datatable/datatable.component'
import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { TableCellData } from '../../table/table-cell.models'
import { TheSeamTableColumn } from '../../table/table-column'
import { TableComponent } from '../../table/table/table.component'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'
import { TableCellTypeConfigProgressCircle } from './table-cell-type-progress-circle-config'

@Component({
  selector: 'seam-table-cell-type-progress-circle',
  templateUrl: './table-cell-type-progress-circle.component.html',
  styleUrls: ['./table-cell-type-progress-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeProgressCircleComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value: number | null | undefined

  colData?: TheSeamTableColumn<'progress-circle', TableCellTypeConfigProgressCircle>

  fillBackground: boolean = false
  showText: boolean = false
  hiddenOnEmpty: boolean = true
  pending: boolean = false
  tooltip: string
  tooltipClass: string
  tooltipPlacement: string
  tooltipContainer: string

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

    this.value = tableData && coerceNumberProperty(tableData.value)
    this.colData = tableData && tableData.colData

    if (this.colData && this.colData.cellTypeConfig) {
      this._setCellTypeConfigProps(this.colData.cellTypeConfig, tableData)
    }

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = coerceNumberProperty(v.changes.value.currentValue)
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            this.colData = v.changes.colData.currentValue
            if (this.colData && this.colData.cellTypeConfig) {
              this._setCellTypeConfigProps(this.colData.cellTypeConfig, tableData)
            }
            this._cdf.markForCheck()
          }
        })
    }
  }

  private _parseConfigValue(val, tableData) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _setCellTypeConfigProps(config: TableCellTypeConfigProgressCircle, tableData): void {
    this.fillBackground = coerceBooleanProperty(this._parseConfigValue(config.fillBackground, tableData))
    this.showText = coerceBooleanProperty(this._parseConfigValue(config.showText, tableData))
    this.hiddenOnEmpty = coerceBooleanProperty(this._parseConfigValue(config.hiddenOnEmpty, tableData))
    this.pending = coerceBooleanProperty(this._parseConfigValue(config.pending, tableData))
    this.tooltip = this._parseConfigValue(config.tooltip, tableData)
    this.tooltipClass = this._parseConfigValue(config.tooltipClass, tableData)
    this.tooltipPlacement = this._parseConfigValue(config.tooltipPlacement, tableData) || 'auto'
    this.tooltipContainer = this._parseConfigValue(config.tooltipContainer, tableData)
  }

}
