import { Observable } from 'rxjs'

import { DataFilterState, DataFilter } from '@theseam/ui-common/data-filters'

import { TheSeamPageInfo } from './page-info'
import { SortEvent } from './sort-event'
import { SortItem } from './sort-item'
import { TheSeamDatatableColumn } from './table-column'
import { SortType } from '@marklb/ngx-datatable'

// TODO: Replace BehaviorSubject based observables with change only emitting
// observables.
export interface TheSeamDatatableAccessor {

  columns: TheSeamDatatableColumn[]

  readonly columns$: Observable<TheSeamDatatableColumn[]>

  rows: any[]

  readonly rows$: Observable<any[]>

  filters: DataFilter[]

  readonly filters$: Observable<DataFilter[]>

  sortType: SortType

  sorts: SortItem[]

  // readonly sorts$: Observable<SortItem[]>

  sort: Observable<SortEvent>

  readonly filterStates: Observable<DataFilterState[]>

  readonly page: Observable<TheSeamPageInfo>

  pageInfo: TheSeamPageInfo
}
