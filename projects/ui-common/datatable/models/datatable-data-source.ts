import { DataSource } from '@angular/cdk/collections'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'

import { TheSeamDatatableAccessor } from './datatable-accessor'
import { TheSeamPageInfo } from './page-info'
import { SortItem } from './sort-item'

export abstract class DatatableDataSource<TRow> extends DataSource<TRow> {

  private readonly _datatableSubject = new BehaviorSubject<TheSeamDatatableAccessor | undefined>(undefined)

  public readonly sorts$: Observable<SortItem[]>
  public readonly filterStates$: Observable<DataFilterState[]>
  public readonly page$: Observable<TheSeamPageInfo>

  constructor() {
    super()

    this.sorts$ = this._datatableSubject.pipe(
      switchMap(_datatable => {
        if (!_datatable) {
          return of([])
        }

        return _datatable.sort.pipe(
          map(v => v.sorts),
          startWith(_datatable.sorts)
        )
      })
    )

    this.filterStates$ = this._datatableSubject.pipe(
      switchMap(_datatable => {
        if (!_datatable) {
          return of([])
        }

        return _datatable.filterStates
      })
    )

    this.page$ = this._datatableSubject.pipe(
      switchMap(_datatable => {
        if (!_datatable) {
          return of({
            offset: 0,
            pageSize: 0,
            limit: undefined,
            count: 0
          })
        }

        return _datatable.page.pipe(
          startWith(_datatable.pageInfo)
        )
      })
    )
  }

  // connect(): Observable<readonly TRow[]> {
  //   return this.
  // }

  // disconnect(): void {
  //   throw new Error('Method not implemented.')
  // }

  public setDatatableAccessor(accessor: TheSeamDatatableAccessor): void {
    this._datatableSubject.next(accessor)
  }

}
