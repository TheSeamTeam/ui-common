import { defer, Observable, of, Subject } from 'rxjs'
import { repeatWhen } from 'rxjs/operators'

import { composeDataFilters, DataFilter } from './data-filter'

export class DataFiltersManager {

  private readonly _filtersChanged = new Subject<void>()

  private readonly _filters: DataFilter[] = []

  public readonly filtersChanged = this._filtersChanged.asObservable()

  get filters(): DataFilter[] { return this._filters }

  public addFilters(filters: DataFilter[]): void {
    if (filters.length === 0) {
      return
    }

    for (const f of filters) {
      if (this._hasFilter(f)) {
        throw Error(`Filter '${f.name}'(${f.name}) already exists.`)
      }

      this._filters.push(f)
    }

    this._filtersChanged.next()
  }

  public removeFilters(filters: DataFilter[]): void {
    if (filters.length === 0) {
      return
    }

    for (const filter of filters) {
      const idx = this._filters.findIndex(f => this._isSameFilter(f, filter))
      if (idx === -1) {
        throw Error(`Filter '${filter.name}' not found.`)
      }

      this._filters.splice(idx, 1)
    }

    this._filtersChanged.next()
  }

  public filter<T>(data: T[]): Observable<T[]> {
    return defer(() => of().pipe(composeDataFilters(this.filters))).pipe(
      repeatWhen<any>(() => this.filtersChanged)
    )
  }

  private _hasFilter(filter: DataFilter): boolean {
    return this._filters.findIndex(f => this._isSameFilter(filter, f)) !== -1
  }

  private _isSameFilter(f1: DataFilter, f2: DataFilter): boolean {
    const ident1 = f1.uid
    const ident2 = f2.uid
    return ident1 === ident2
  }

}
