import { DynamicDatatableColumn } from '../../datatable-dynamic-def'

export function setDynamicDatatableColumnsDefaults(
  columns: DynamicDatatableColumn[]
) {
  for (const col of columns) {
    if (!col.cellType) {
      col.cellType = 'string'
    }
  }
}
