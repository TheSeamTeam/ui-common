import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { TableCellData } from '../../table/table-cell.models'

import { TheSeamTableColumn } from '../../table/table-column'
import { TableCellTypesHelpersService } from '../services/table-cell-types-helpers.service'
import { TableCellTypeConfigProgressCircle } from './table-cell-type-progress-circle-config'

@Component({
  selector: 'seam-table-cell-type-progress-circle',
  templateUrl: './table-cell-type-progress-circle.component.html',
  styleUrls: ['./table-cell-type-progress-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeProgressCircleComponent implements OnInit, OnDestroy {

  @Input() value: number | null | undefined

  colData?: TheSeamTableColumn<'progress-circle', TableCellTypeConfigProgressCircle>

  fillBackground: boolean
  showText: boolean
  hiddenOnEmpty: boolean
  total: number
  numComplete: number
  tooltip: string
  tooltipClass: string
  tooltipPlacement: string
  tooltipContainer: string

  constructor(
    private _cdf: ChangeDetectorRef,
    private _tableCellTypeHelpers: TableCellTypesHelpersService,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'progress-circle', TableCellTypeConfigProgressCircle>
  ) {
    const tableData = _tableData

    this.value = tableData && tableData.value
    this.colData = tableData && tableData.colData

    if (this.colData && this.colData.cellTypeConfig) {
      this.fillBackground = this.colData.cellTypeConfig.fillBackground
      this.showText = this.colData.cellTypeConfig.showText
      this.hiddenOnEmpty = this.colData.cellTypeConfig.hiddenOnEmpty
      this.total = this.colData.cellTypeConfig.total
      this.numComplete = this.colData.cellTypeConfig.numComplete
      this.tooltip = this._parseConfigValue(this.colData.cellTypeConfig.tooltip, tableData)
      this.tooltipClass = this.colData.cellTypeConfig.tooltipClass
      this.tooltipPlacement = this.colData.cellTypeConfig.tooltipPlacement
      this.tooltipContainer = this.colData.cellTypeConfig.tooltipContainer
    }

    if (tableData) {
      tableData.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            this.colData = v.changes.colData.currentValue
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

  ngOnDestroy() { }

}
