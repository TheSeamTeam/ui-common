import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { SeamIcon } from '@theseam/ui-common/icon'
import { TableCellTypesHelpersService, TABLE_CELL_DATA } from '@theseam/ui-common/table-cell-type'
import type { TableCellData, TheSeamTableColumn } from '@theseam/ui-common/table-cell-type'

import { TableCellTypeConfigProgressCircleIcon } from './table-cell-type-progress-circle-icon-config'

@Component({
  selector: 'seam-table-cell-type-progress-circle-icon',
  templateUrl: './table-cell-type-progress-circle-icon.component.html',
  styleUrls: ['./table-cell-type-progress-circle-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeProgressCircleIconComponent implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input() value: number | null | undefined

  row?: any
  rowIndex?: number
  colData?: TheSeamTableColumn<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>

  displayIcon = false
  icon?: SeamIcon

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>
  ) {
    const tableData = _tableData
    this.value = tableData && tableData.value
    this.row = tableData && tableData.row
    this.rowIndex = tableData && tableData.rowIndex
    this.colData = tableData && tableData.colData

    this._setIcon(tableData)

    if (tableData) {
      tableData.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (Object.prototype.hasOwnProperty.call(v.changes, 'value')) {
            this.value = v.changes.value.currentValue
            this._setIcon(tableData)
            this._cdf.markForCheck()
          }

          if (Object.prototype.hasOwnProperty.call(v.changes, 'colData')) {
            this.colData = v.changes.colData.currentValue
            this._setIcon(tableData)
            this._cdf.markForCheck()
          } else {
            if (Object.prototype.hasOwnProperty.call(v.changes, 'row')) {
              this._setIcon(tableData)
              this._cdf.markForCheck()
            }
          }
        })
    }
  }

  private _setIcon(tableData?: TableCellData<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>) {
    if (tableData &&
      tableData.colData &&
      tableData.colData.cellTypeConfig &&
      tableData.colData.cellTypeConfig.displayIcon &&
      tableData.colData.cellTypeConfig.icon &&
      this._parseConfigValue(tableData.colData.cellTypeConfig.displayIcon, tableData) &&
      this._parseConfigValue(tableData.colData.cellTypeConfig.icon, tableData)) {
        this.icon = this._parseConfigValue(tableData.colData.cellTypeConfig.icon, tableData)
        this.displayIcon = this._parseConfigValue(tableData.colData.cellTypeConfig.displayIcon, tableData)
      }
  }

  private _parseConfigValue(val: any, tableData?: TableCellData<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

}
