import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import {
  DynamicDatatableCellTypeConfigDate,
  // DynamicDatatableCellTypeConfigDateAction
} from '../../datatable-dynamic/index'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'

import { DATATABLE_CELL_DATA } from '../../datatable/datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable/datatable-cell-type-selector/datatable-cell.models'

@Component({
  selector: 'seam-table-cell-type-date',
  templateUrl: './table-cell-type-date.component.html',
  styleUrls: ['./table-cell-type-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeDateComponent implements OnInit, OnDestroy {

  @Input() value?: string | null
  @Input() format?: string

  constructor(
    @Optional() @Inject(DATATABLE_CELL_DATA) _datatableData?: IDatatableCellData<any, string>,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: ITableCellData<any, string>
  ) {
    const _data = _datatableData || _tableData

    this.value = _data && _data.value
    this.format = _data && _data.colData && _data.colData.cellProps

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.format !== this.format) {
              this.format = colData.format
            } else {
              this.format = undefined
            }
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

}
