import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, Optional } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { TABLE_CELL_DATA } from '@theseam/ui-common/table-cell-type'
import type { TableCellData } from '@theseam/ui-common/table-cell-type'

import { TableCellTypeConfigDate } from './table-cell-type-date-config'

@Component({
  selector: 'seam-table-cell-type-date',
  templateUrl: './table-cell-type-date.component.html',
  styleUrls: ['./table-cell-type-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeDateComponent implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input() value: string | undefined | null
  @Input() format: string | undefined | null

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
          if (Object.prototype.hasOwnProperty.call(v.changes, 'value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }

          if (Object.prototype.hasOwnProperty.call(v.changes, 'colData')) {
            const colData = v.changes.colData.currentValue
            if (colData && colData.cellTypeConfig && colData.cellTypeConfig.format !== this.format) {
              this.format = colData.cellTypeConfig.format
            }
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

}
