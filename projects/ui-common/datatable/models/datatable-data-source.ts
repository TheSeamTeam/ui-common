import { DataSource } from '@angular/cdk/collections'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'

import { TheSeamDatatableAccessor } from './datatable-accessor'
import { TheSeamPageInfo } from './page-info'
import { SortItem } from './sort-item'

export class DatatableDataSource<TRow> extends DataSource<TRow> {

  public readonly sorts$: Observable<SortItem[]>
  public readonly filterStates$: Observable<DataFilterState[]>
  public readonly page$: Observable<TheSeamPageInfo>

  constructor(
    private readonly _datatable: TheSeamDatatableAccessor
  ) {
    super()

    this.sorts$ = _datatable.sort.pipe(
      map(v => v.sorts),
      startWith(_datatable.sorts)
    )

    this.filterStates$ = _datatable.filterStates

    this.page$ = _datatable.page.pipe(
      startWith(_datatable.pageInfo)
    )
  }

  connect(): Observable<readonly TRow[]> {
    throw new Error('Method not implemented.')
  }

  disconnect(): void {
    throw new Error('Method not implemented.')
  }

}
