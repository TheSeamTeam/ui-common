import { setColumnDefaults as _scd } from '@marklb/ngx-datatable'
import { setColumnAlignDefaults } from '@theseam/ui-common/table-cell-type'

import { TheSeamDatatableColumn } from '../models/table-column'

export function setColumnDefaults(columns: TheSeamDatatableColumn[]): void {
  for (const column of columns) {
    if (!Object.prototype.hasOwnProperty.call(column, 'hidden')) {
      column.hidden = false
    }

    setColumnAlignDefaults(column)
  }
  _scd(columns)
}
