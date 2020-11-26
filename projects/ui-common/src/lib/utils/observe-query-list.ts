import { QueryList } from '@angular/core'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

export function observeQueryList<T>(queryList: QueryList<T>, emitCurrentValue = true): Observable<T[]> {
  return queryList.changes.pipe(
    startWith(queryList),
    map(v => v.toArray() as T[])
  )
}
