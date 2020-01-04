import { ITheSeamDatatableColumn } from '../../datatable/index'

import { ITheSeamDatatablePreferencesColumn } from '../models/preferences'

export function withStoredColumnInfo(
  columns: ITheSeamDatatableColumn[],
  preferenceColumns: ITheSeamDatatablePreferencesColumn[]
): ITheSeamDatatableColumn[] {
  const _columns: ITheSeamDatatableColumn[] = []
  for (const col of columns) {
    const storedCol = preferenceColumns.find(v => v.prop === col.prop)
    if (storedCol) {
      const _col = { ...col }
      _col.width = storedCol.width
      _col.canAutoResize = storedCol.canAutoResize
      _columns.push(_col)
    } else {
      _columns.push(col)
    }
  }
  return _columns
}
