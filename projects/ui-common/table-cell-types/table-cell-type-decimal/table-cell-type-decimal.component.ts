import { formatNumber } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TableCellTypesHelpersService, TABLE_CELL_DATA, TheSeamTableColumn } from '@theseam/ui-common/table-cell-type'
import type { TableCellData } from '@theseam/ui-common/table-cell-type'

import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { notNullOrUndefined } from 'projects/ui-common/utils/not-null-or-undefined'
import { TableCellTypeConfigDecimal } from './table-cell-type-decimal-config'

@Component({
  selector: 'seam-table-cell-type-decimal',
  templateUrl: './table-cell-type-decimal.component.html',
  styleUrls: ['./table-cell-type-decimal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeDecimalComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value: string | undefined | null

  row?: any
  rowIndex?: number
  colData?: TheSeamTableColumn<'decimal', TableCellTypeConfigDecimal>
  textAlign?: 'left' | 'center' | 'right'

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'decimal', TableCellTypeConfigDecimal>
  ) {
    const tableData = _tableData
    this.value = tableData && this._formatDecimal(tableData.value, tableData)
    this.row = tableData && tableData.row
    this.rowIndex = tableData && tableData.rowIndex
    this.colData = tableData && tableData.colData
    this.textAlign = this._parseConfigValue(tableData?.colData?.cellTypeConfig?.textAlign, tableData) || 'right'

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = this._formatDecimal(v.changes.value.currentValue, tableData)
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            this.colData = v.changes.colData.currentValue
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _formatDecimal(currentValue?: any, tableData?: TableCellData<'decimal', TableCellTypeConfigDecimal> | undefined): string {
    const config = tableData?.colData?.cellTypeConfig
    const formatDecimal = notNullOrUndefined(config?.formatNumber) ?
      this._parseConfigValue(coerceBooleanProperty(config?.formatNumber), tableData) : true
    const locale = this._parseConfigValue(config?.locale, tableData) || 'en-US'
    const minIntegerDigits = this._parseConfigValue(config?.minIntegerDigits, tableData) || 1
    const minFractionDigits = this._parseConfigValue(config?.minFractionDigits, tableData) || 0
    const maxFractionDigits = this._parseConfigValue(config?.maxFractionDigits, tableData) || 3
    const format = `${ minIntegerDigits }.${ minFractionDigits }-${ maxFractionDigits }`

    return formatDecimal ? formatNumber(currentValue, locale, format) : currentValue
  }

  private _parseConfigValue(val?: any, tableData?: TableCellData<'decimal', TableCellTypeConfigDecimal>) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

}
