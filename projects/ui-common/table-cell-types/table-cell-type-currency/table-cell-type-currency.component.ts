import { formatCurrency } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TableCellTypesHelpersService, TABLE_CELL_DATA, TheSeamTableColumn } from '@theseam/ui-common/table-cell-type'
import type { TableCellData } from '@theseam/ui-common/table-cell-type'
import { isNumeric, notNullOrUndefined } from '@theseam/ui-common/utils'

import { coerceBooleanProperty } from '@angular/cdk/coercion'

import { TableCellTypeConfigCurrency } from './table-cell-type-currency-config'

@Component({
  selector: 'seam-table-cell-type-currency',
  templateUrl: './table-cell-type-currency.component.html',
  styleUrls: ['./table-cell-type-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeCurrencyComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value: string | null | undefined

  row?: any
  rowIndex?: number
  colData?: TheSeamTableColumn<'currency', TableCellTypeConfigCurrency>
  textAlign?: 'left' | 'center' | 'right'
  // TODO: implement
  // titleAttr?: string

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'currency', TableCellTypeConfigCurrency>
  ) {
    const tableData = _tableData
    this.value = tableData && this._formatCurrency(tableData.value, tableData)
    this.row = tableData && tableData.row
    this.rowIndex = tableData && tableData.rowIndex
    this.colData = tableData && tableData.colData
    this.textAlign = this._parseConfigValue(tableData?.colData?.cellTypeConfig?.textAlign, tableData) || 'right'
    // this.titleAttr = this._parseConfigValue(tableData?.colData?.cellTypeConfig?.titleAttr, tableData) || this.value

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = this._formatCurrency(v.changes.value.currentValue, tableData)
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

  private _formatCurrency(currentValue?: any, tableData?: TableCellData<'currency', TableCellTypeConfigCurrency>): string {
      const config = tableData?.colData?.cellTypeConfig
      const defaultToEmpty = notNullOrUndefined(config?.defaultToEmpty) ?
        this._parseConfigValue(coerceBooleanProperty(config?.defaultToEmpty), tableData) : true
      const valueIsNumeric = isNumeric(currentValue)

      if (!valueIsNumeric) {
        if (defaultToEmpty) {
          // return empty string instead of $0 when currentValue is empty or unparseable
          return ''
        } else {
          // set non-numeric value to 0 so it can be formatted the same as other numbers
          currentValue = 0
        }
      }

      const locale = this._parseConfigValue(config?.locale, tableData) || 'en-US'
      const currency = this._parseConfigValue(config?.currency, tableData) || '$'
      const currencyCode = this._parseConfigValue(config?.currencyCode, tableData) || 'USD'

      const minIntegerDigits = this._parseConfigValue(config?.minIntegerDigits, tableData) || 1
      const minFractionDigits = this._parseConfigValue(config?.minFractionDigits, tableData) || 2
      const maxFractionDigits = this._parseConfigValue(config?.maxFractionDigits, tableData) || 2
      const format = `${ minIntegerDigits }.${ minFractionDigits }-${ maxFractionDigits }`

      return formatCurrency(currentValue, locale, currency, currencyCode, format )
  }

  private _parseConfigValue(val?: any, tableData?: TableCellData<'currency', TableCellTypeConfigCurrency>) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

}
