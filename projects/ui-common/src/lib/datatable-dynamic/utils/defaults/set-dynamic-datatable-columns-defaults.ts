import { IDynamicDatatableColumn } from '../../datatable-dynamic-def'
import { IDynamicDatatableCellType } from '../../models/cell-type'
import { DynamicDatatableCellTypeConfig } from '../../models/cell-type-config'

export function setDynamicDatatableColumnsDefaults(
  columns: IDynamicDatatableColumn<IDynamicDatatableCellType, DynamicDatatableCellTypeConfig<IDynamicDatatableCellType>>[]
) {
  for (const col of columns) {
    if (!col.cellType) {
      col.cellType = 'string'
    }
  }
}
