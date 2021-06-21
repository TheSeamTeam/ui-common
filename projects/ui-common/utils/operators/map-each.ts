import { from, Observable } from 'rxjs'
import { map, switchMap, toArray } from 'rxjs/operators'

export function mapEach<T, R>(predicate: (value: T) => R) {
  return (source$: Observable<T[]>): Observable<R[]> =>
    source$.pipe(switchMap(v => from(v).pipe(map(m => predicate(m)), toArray())))
}
