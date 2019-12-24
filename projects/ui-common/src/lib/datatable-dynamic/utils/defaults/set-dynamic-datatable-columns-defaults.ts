import { IDynamicDatatableColumn } from '../../datatable-dynamic-def'
import { IDynamicDatatableCellType } from '../../models/cell-type'

export function setDynamicDatatableColumnsDefaults(
  columns: IDynamicDatatableColumn<IDynamicDatatableCellType>[]
) {
  for (const col of columns) {
    if (!col.cellType) {
      col.cellType = 'string'
    }
  }
}
