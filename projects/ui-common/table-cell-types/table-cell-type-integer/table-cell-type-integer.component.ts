import { formatNumber } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TableCellTypesHelpersService, TABLE_CELL_DATA, TheSeamTableColumn } from '@theseam/ui-common/table-cell-type'
import type { TableCellData } from '@theseam/ui-common/table-cell-type'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { TableCellTypeConfigInteger } from './table-cell-type-integer-config'

@Component({
  selector: 'seam-table-cell-type-integer',
  templateUrl: './table-cell-type-integer.component.html',
  styleUrls: ['./table-cell-type-integer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeIntegerComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value: string | null | undefined

  row?: any
  rowIndex?: number
  colData?: TheSeamTableColumn<'integer', TableCellTypeConfigInteger>
  textAlign?: 'left' | 'center' | 'right'

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'integer', TableCellTypeConfigInteger>
  ) {
    const tableData = _tableData
    this.value = tableData && this._formatInteger(tableData.value, tableData)
    this.row = tableData && tableData.row
    this.rowIndex = tableData && tableData.rowIndex
    this.colData = tableData && tableData.colData
    this.textAlign = this._parseConfigValue(tableData?.colData?.cellTypeConfig?.textAlign, tableData) || 'right'

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = this._formatInteger(v.changes.value.currentValue, tableData)
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

  private _formatInteger(currentValue?: any, tableData?: TableCellData<'integer', TableCellTypeConfigInteger> | undefined): string {
    const config = tableData?.colData?.cellTypeConfig
    const formatInteger = notNullOrUndefined(config?.formatNumber) ?
      this._parseConfigValue(coerceBooleanProperty(config?.formatNumber), tableData) : true
    const locale = this._parseConfigValue(config?.locale, tableData) || 'en-US'
    const minIntegerDigits = this._parseConfigValue(config?.minIntegerDigits, tableData) || 1
    const format = `${ minIntegerDigits }.0-0`

    return formatInteger ? formatNumber(currentValue, locale, format ) : currentValue
  }

  private _parseConfigValue(val?: any, tableData?: TableCellData<'integer', TableCellTypeConfigInteger>) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

}
