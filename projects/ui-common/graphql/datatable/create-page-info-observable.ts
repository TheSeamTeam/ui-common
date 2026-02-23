import { EMPTY, merge, Observable, Subscriber } from 'rxjs'
import { auditTime, map, switchMap, tap } from 'rxjs/operators'

import { TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'
import { getPageInfo } from './get-page-info'

export function createPageInfoObservable(
  datatable$: Observable<GqlDatatableAccessor | null | undefined>,
  defaultPageSize: number = 20,
): Observable<TheSeamPageInfo> {
  return new Observable<TheSeamPageInfo>(
    (subscriber: Subscriber<TheSeamPageInfo>) => {
      let prev: TheSeamPageInfo | null = null
      const handlePageInfo = (pageInfo: TheSeamPageInfo | null) => {
        if (!_isPageInfoSame(prev, pageInfo)) {
          if (pageInfo !== null) {
            subscriber.next(pageInfo)
          }
          prev = pageInfo
        }
      }

      const dtSub = datatable$
        .pipe(
          switchMap((dt) => {
            if (!notNullOrUndefined(dt)) {
              handlePageInfo(null)
              return EMPTY
            }

            handlePageInfo(getPageInfo(dt, defaultPageSize))

            // `page` does not emit when the page size changes (e.g. on
            // window resize). Merging the `resize` event is a workaround.
            const resize$ = dt.resize.pipe(
              auditTime(100),
              map(() => dt.pageInfo),
            )
            return merge(dt.page, resize$).pipe(tap((p) => handlePageInfo(p)))
          }),
        )
        .subscribe()

      return () => {
        dtSub.unsubscribe()
      }
    },
  )
}

function _isPageInfoSame(
  prev: TheSeamPageInfo | null,
  curr: TheSeamPageInfo | null,
): boolean {
  if (
    prev?.offset === curr?.offset &&
    prev?.pageSize === curr?.pageSize &&
    prev?.limit === curr?.limit &&
    prev?.count === curr?.count
  ) {
    return true
  }
  return false
}
