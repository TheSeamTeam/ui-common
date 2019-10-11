import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { ITheSeamTableColumn } from './table-column'

export interface ITableCellDataChange {
  data: ITableCellData
  changes: SimpleChanges
}

export interface ITableCellData<R = any, V = any> {
  row: R
  rowIndex: number
  colData: ITheSeamTableColumn<R>
  value: V
  changed: Observable<ITableCellDataChange>
}
