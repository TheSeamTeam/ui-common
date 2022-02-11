import { setColumnDefaults as _scd } from '@marklb/ngx-datatable'

import { TheSeamDatatableColumn } from '../models/table-column'

export function setColumnDefaults(columns: TheSeamDatatableColumn[]): void {
  for (const column of columns) {
    if (!column.hasOwnProperty('hidden')) {
      column.hidden = false
    }
  }
  _scd(columns)
}
