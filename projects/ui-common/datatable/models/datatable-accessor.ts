import { Observable } from 'rxjs'

import { DataFilterState, IDataFilter } from '@theseam/ui-common/data-filters'

import { TheSeamPageInfo } from './page-info'
import { SortEvent } from './sort-event'
import { SortItem } from './sort-item'
import { TheSeamDatatableColumn } from './table-column'

// TODO: Replace BehaviorSubject based observables with change only emitting
// observables.
export interface TheSeamDatatableAccessor {

  columns: TheSeamDatatableColumn[]

  readonly columns$: Observable<TheSeamDatatableColumn[]>

  rows: any[]

  readonly rows$: Observable<any[]>

  filters: IDataFilter[]

  readonly filters$: Observable<IDataFilter[]>

  sorts: SortItem[]

  // readonly sorts$: Observable<SortItem[]>

  sort: Observable<SortEvent>

  readonly filterStates: Observable<DataFilterState[]>

  readonly page: Observable<TheSeamPageInfo>

  pageInfo: TheSeamPageInfo
}
