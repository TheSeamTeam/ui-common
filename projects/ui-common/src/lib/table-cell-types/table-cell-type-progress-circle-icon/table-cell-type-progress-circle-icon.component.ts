import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import type { TableCellData } from '../../table/table-cell.models'

import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { SeamIcon } from '../../icon'
import { TheSeamTableColumn } from '../../table/table-column'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'
import { TableCellTypeConfigProgressCircleIcon } from './table-cell-type-progress-circle-icon-config'

@Component({
  selector: 'seam-table-cell-type-progress-circle-icon',
  templateUrl: './table-cell-type-progress-circle-icon.component.html',
  styleUrls: ['./table-cell-type-progress-circle-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeProgressCircleIconComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value: number | null | undefined

  row?: any
  rowIndex?: number
  colData?: TheSeamTableColumn<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>

  displayIcon: boolean = false
  icon: SeamIcon

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
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._setIcon(tableData)
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            this.colData = v.changes.colData.currentValue
            this._setIcon(tableData)
            this._cdf.markForCheck()
          }
        })
    }
  }

  private _setIcon(tableData?: TableCellData<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>) {
    if (tableData &&
      tableData.value >= 100 &&
      tableData.colData &&
      tableData.colData.cellTypeConfig &&
      this._parseConfigValue(tableData.colData.cellTypeConfig.icon, tableData)) {
        const icon = this._parseConfigValue(tableData.colData.cellTypeConfig.icon, tableData)
        this.icon = icon
        this.displayIcon = true
      } else {
        this.displayIcon = false
      }
  }

  private _parseConfigValue(val, tableData?: TableCellData<'progress-circle-icon', TableCellTypeConfigProgressCircleIcon>) {
    const contextFn = () => this._tableCellTypeHelpers.getValueContext(val, tableData)
    return this._tableCellTypeHelpers.parseValueProp(val, contextFn)
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

}
