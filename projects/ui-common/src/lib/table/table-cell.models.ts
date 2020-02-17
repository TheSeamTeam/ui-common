import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { TableCellTypeConfig } from '../table-cell-types/table-cell-type-config'
import { TableCellTypeName } from '../table-cell-types/table-cell-type-name'

import { TheSeamTableColumn } from './table-column'

export interface TableCellDataChange<T extends TableCellTypeName, C extends TableCellTypeConfig<T>> {
  data: TableCellData<T, C>
  changes: SimpleChanges
}

export interface TableCellData<T extends TableCellTypeName, C extends TableCellTypeConfig<T>, R = any, V = any> {
  row: R
  rowIndex: number
  colData: TheSeamTableColumn<T, C>
  value: V
  changed: Observable<TableCellDataChange<T, C>>
}
