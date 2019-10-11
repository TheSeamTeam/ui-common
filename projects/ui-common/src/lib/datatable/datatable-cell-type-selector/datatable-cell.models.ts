import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { ITheSeamDatatableColumn } from '../models/table-column'

export interface IDatatableCellDataChange {
  data: IDatatableCellData
  changes: SimpleChanges
}

export interface IDatatableCellData<R = any, V = any> {
  row: R
  rowIndex: number
  colData: ITheSeamDatatableColumn<R>
  value: V
  changed: Observable<IDatatableCellDataChange>
}
