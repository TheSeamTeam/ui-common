import { Component, Inject, Input, OnInit, Optional } from '@angular/core'

import { DATATABLE_CELL_DATA } from '../../datatable-cell-type-selector/datatable-cell-tokens'
import { IDatatableCellData } from '../../datatable-cell-type-selector/datatable-cell.models'

@Component({
  selector: 'seam-datatable-cell-type-date',
  templateUrl: './datatable-cell-type-date.component.html',
  styleUrls: ['./datatable-cell-type-date.component.scss']
})
export class DatatableCellTypeDateComponent<R = any, V = any> implements OnInit {

  @Input() value?: V
  @Input() format?: string

  constructor(
    @Optional() @Inject(DATATABLE_CELL_DATA) public data?: IDatatableCellData<R, V>
  ) {
    this.value = data && data.value
    this.format = data && data.colData && data.colData.cellProps
  }

  ngOnInit() { }

}
