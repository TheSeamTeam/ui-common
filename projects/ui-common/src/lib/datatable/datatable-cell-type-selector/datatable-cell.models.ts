import { ITheSeamTableColumn } from '../models/table-column'

export interface IDatatableCellData<R = any, V = any> {
  row: R
  rowIndex: number
  colData: ITheSeamTableColumn<R>
  value: V
}
