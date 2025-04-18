import { hasProperty } from '@theseam/ui-common/utils'

import { TheSeamDatatablePreferencesColumn } from '../models/preferences'
import { TheSeamDatatableColumn } from '../models/table-column'

export function withStoredColumnInfo(
  columns: TheSeamDatatableColumn[],
  preferenceColumns: TheSeamDatatablePreferencesColumn[]
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
