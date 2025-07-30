import { DatatableComponent, SortItem } from '@theseam/ui-common/datatable'
import { map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs'

export function createSortsObservable(datatable$: Observable<DatatableComponent | undefined | null>) {
  // NOTE: There is a bug in our datatable wrapper that isn't propagating
  // external sorting changes to the wrapped datatable component, which we
  // observe sort events from. This workaround observes our wrappers internal
  // column change events, which emits all changes to a column that our
  // datatable tracks and gets the sorts from our wrapper if externalSorting is
  // enabled.
  const observeSortsWorkaround = (dt: DatatableComponent): Observable<SortItem[]> => {
    return (dt as any)._columnsAlterationsManager.changes.pipe(
      map(() => dt.externalSorting ? (dt as any)._sorts : dt.sorts),
      startWith(dt.externalSorting ? (dt as any)._sorts : dt.sorts),
      // tap(v => console.log(v)),
    )
  }

  return datatable$.pipe(
    switchMap(dt => {
      if (dt) {
        // NOTE: Switch back to this when our datatable wrapper's sort events are fixed.
        // return dt.sort.pipe(
        //   map(v => v.sorts),
        //   startWith(dt.sorts)
        // )

        return observeSortsWorkaround(dt)
      }

      return of([])
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )
}
