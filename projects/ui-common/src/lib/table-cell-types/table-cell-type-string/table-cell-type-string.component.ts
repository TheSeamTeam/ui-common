import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { TABLE_CELL_DATA } from '../../table/table-cell-tokens'
import { ITableCellData } from '../../table/table-cell.models'

@Component({
  selector: 'seam-table-cell-type-string',
  templateUrl: './table-cell-type-string.component.html',
  styleUrls: ['./table-cell-type-string.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellTypeStringComponent implements OnInit, OnDestroy {

  @Input() value?: string | null

  constructor(
    private _cdf: ChangeDetectorRef,
    @Optional() @Inject(TABLE_CELL_DATA) _tableData?: ITableCellData<any, string>
  ) {
    const _data = _tableData

    this.value = _data && _data.value

    if (_data) {
      _data.changed
        .pipe(untilDestroyed(this))
        .subscribe(v => {
          if (v.changes.hasOwnProperty('value')) {
            this.value = v.changes.value.currentValue
            this._cdf.markForCheck()
          }
        })
    }
  }

  ngOnInit() { }

  ngOnDestroy() { }

}
