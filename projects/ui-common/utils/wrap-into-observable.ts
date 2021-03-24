import { from, isObservable, Observable } from 'rxjs'

export function wrapIntoObservable<T>(value: T | Promise<T>| Observable<T>): Observable<T> {
  if (isObservable(value)) {
    return value
  }

  return from(Promise.resolve(value))
}
