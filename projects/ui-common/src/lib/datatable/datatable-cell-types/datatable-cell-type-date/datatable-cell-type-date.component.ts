import { Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'

import { untilDestroyed } from 'ngx-take-until-destroy'
import { DATATABLE_CELL_DATA } from '../../datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable-cell-type-selector/datatable-cell.models'

@Component({
  selector: 'seam-datatable-cell-type-date',
  templateUrl: './datatable-cell-type-date.component.html',
  styleUrls: ['./datatable-cell-type-date.component.scss']
})
export class DatatableCellTypeDateComponent<R = any, V = any> implements OnInit, OnDestroy {

  @Input() value?: V
  @Input() format?: string

  constructor(
    @Optional() @Inject(DATATABLE_CELL_DATA) public _data?: IDatatableCellData<R, V>
  ) {
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
