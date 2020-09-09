import { TheSeamDatatableColumn } from '../../datatable/index'
import { hasProperty } from '../../utils/index'

import { ITheSeamDatatablePreferencesColumn } from '../models/preferences'

export function withStoredColumnInfo(
  columns: TheSeamDatatableColumn[],
  preferenceColumns: ITheSeamDatatablePreferencesColumn[]
): TheSeamDatatableColumn[] {
  const _columns: TheSeamDatatableColumn[] = []
  for (const col of columns) {
    const storedCol = preferenceColumns.find(v => v.prop === col.prop)
    if (storedCol) {
      const _col = { ...col }
      if (hasProperty(storedCol, 'width')) { _col.width = Math.max(storedCol.width, 0) }
      _col.canAutoResize = storedCol.canAutoResize
      _columns.push(_col)
    } else {
      _columns.push(col)
    }
  }
  return _columns
}
