import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { ITheSeamTableColumn } from '../models/table-column'

export interface IDatatableCellDataChange {
  data: IDatatableCellData
  changes: SimpleChanges
}

export interface IDatatableCellData<R = any, V = any> {
  row: R
  rowIndex: number
  colData: ITheSeamTableColumn<R>
  value: V
  changed: Observable<IDatatableCellDataChange>
}
