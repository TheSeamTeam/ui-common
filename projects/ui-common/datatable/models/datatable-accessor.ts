import { Observable } from 'rxjs'

import { TheSeamDatatableColumn } from './table-column'

export interface TheSeamDatatableAccessor {
  columns: TheSeamDatatableColumn[]
  rows$: Observable<any[]>
}
