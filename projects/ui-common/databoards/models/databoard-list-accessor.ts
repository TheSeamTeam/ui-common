import { Observable } from 'rxjs'

import { DataFilterState, DataFilter, DataFilterSortType, DataFilterSortItem, DataFilterSortEvent } from '@theseam/ui-common/data-filters'
// import { DataFilterSortItem } from 'projects/ui-common/data-filters/models/sort-item'
// import { DataFilterSortEvent } from 'projects/ui-common/data-filters/models/sort-event'
// import { DataFilterSortType } from 'projects/ui-common/data-filters/models/sort-type'

import { DataboardBoard } from './databoard-board'
import { DataboardCard } from './databoard-card'
import { DataboardBoardCards } from './databoard-board-cards'

// TODO: Replace BehaviorSubject based observables with change only emitting
// observables.
export interface TheSeamDataboardListAccessor {

  // TODO: remove?
  // boards: DataboardBoard[]

  readonly boards$: Observable<DataboardBoard[]>

  // TODO: remove?
  // cards: DataboardCard[]

  readonly cards$: Observable<DataboardCard[]>

  // TODO: remove?
  // boardsAndCards: DataboardBoardCards[]

  readonly boardsAndCards$: Observable<DataboardBoardCards[]>

  // TODO: remove?
  // filters: DataFilter[]

  readonly filters$: Observable<DataFilter[]>

  readonly filterStates$: Observable<DataFilterState[]>

  sortType: DataFilterSortType

  // TODO: remove?
  sorts: DataFilterSortItem[]

  sorts$: Observable<DataFilterSortItem[]>

  // readonly sorts$: Observable<DataFilterSortItem[]>

  sort: Observable<DataFilterSortEvent>

}
