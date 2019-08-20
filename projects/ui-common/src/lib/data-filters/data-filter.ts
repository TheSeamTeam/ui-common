import { InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type IDataFilterFunction = <T>(data: T[]) => Observable<T[]>

export interface IDataFilter {
  /**
   * Filters the data based on the conditions of the filter.
   */
  filter<T>(data: T[]): Observable<T[]>
}

export const THESEAM_DATA_FILTER = new InjectionToken<IDataFilter>('TheSeamDataFilter')

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
