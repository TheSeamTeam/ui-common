import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/**
 * Like tap, but only calls predicate on first emission.
 */
export function tapFirst<T>(predicate: (value: T) => void) {
  let _initialized = false
  return (source$: Observable<T>): Observable<T> =>
    source$.pipe(
      tap(v => {
        if (!_initialized) {
          predicate(v)
          _initialized = true
        }
      })
    )
}
