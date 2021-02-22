import { InjectionToken } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

export type IDataFilterFunction = <T>(data: T[]) => Observable<T[]>

/**
 * State of the filter that would allow an external operation to apply the
 * filtering.
 *
 * This is primarily for server-side filtering.
 */
export interface DataFilterState {
  /**
   * DataFilter's name.
   */
  name: string

  /**
   * Anything necessary for an external implementation to apply this filter.
   */
  state: { [key: string]: any }
}

// TODO: Consider adding something, such as a priority or order, to allow the
// order the filter functions are called in to be declared/influenced
// externally. This would allow the filters that will most likely filter out
// many records quickly to be run before the heavy processing filters.
export interface IDataFilter {
  /**
   * Name used when referencing filter by string.
   */
  name: string

  /**
   * Unique value to prevent a filter being used more than once if it ends up
   * being registered more than once.
   */
  uid: string

  /**
   *
   */
  filterStateChanges: Observable<DataFilterState>

  /**
   * Filters the data based on the conditions of the filter.
   */
  filter<T>(data: T[]): Observable<T[]>

  /**
   *
   */
  filterState(): DataFilterState
}

export const THESEAM_DATA_FILTER = new InjectionToken<IDataFilter>('TheSeamDataFilter')
export const THESEAM_DATA_FILTER_OPTIONS = new InjectionToken<{}>('TheSeamDataFilterOptions')

export function filterOperator<T>(filterFn: IDataFilterFunction) {
  return (source$: Observable<T[]>) =>
    source$.pipe(switchMap(filterFn))
}

export function composeDataFilters(filters: IDataFilter[]) {
  const filterFunctions = filters.map(f => filterOperator(f.filter.bind(f)))
  return (source$: Observable<any>) => {
    let src$ = source$
    for (const f of filterFunctions) {
      src$ = src$.pipe(f)
    }
    return src$
  }
}

export function composeDataFilterStates(filters: IDataFilter[]): Observable<DataFilterState[]> {
  return combineLatest(filters.map(f => f.filterStateChanges.pipe(
    startWith(undefined),
    map(() => f.filterState())
  )))
}
