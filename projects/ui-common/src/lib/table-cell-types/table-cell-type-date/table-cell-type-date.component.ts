import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import type { TableCellData } from '../../table/table-cell.models'

import { TableCellTypeConfigDate } from './table-cell-type-date-config'

@Component({
  selector: 'seam-table-cell-type-date',
  templateUrl: './table-cell-type-date.component.html',
  styleUrls: ['./table-cell-type-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeDateComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

  @Input() value?: string | null
  @Input() format?: string

  constructor(
    private _cdf: ChangeDetectorRef,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: TableCellData<'date', TableCellTypeConfigDate>
  ) {
    const _data = _tableData

    this.value = _data && _data.value
    this.format = _data && _data.colData && _data.colData.cellTypeConfig && _data.colData.cellTypeConfig.format

    if (_data) {
      _data.changed
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (v.changes.hasOwnProperty('colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.format !== this.format) {
              this.format = colData.format
            } else {
              this.format = undefined
            }
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

}
