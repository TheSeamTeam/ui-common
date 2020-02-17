import { DynamicDatatableColumn } from '../../datatable-dynamic-def'
import { DynamicDatatableCellType } from '../../models/cell-type'
import { DynamicDatatableCellTypeConfig } from '../../models/cell-type-config'

export function setDynamicDatatableColumnsDefaults(
  columns: DynamicDatatableColumn<DynamicDatatableCellType, DynamicDatatableCellTypeConfig<DynamicDatatableCellType>>[]
) {
  for (const col of columns) {
    if (!col.cellType) {
      col.cellType = 'string'
    }
  }
}
