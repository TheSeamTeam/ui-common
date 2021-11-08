import { EMPTY, Observable, Subscriber } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

import { TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'
import { getPageInfo } from './get-page-info'

export function createPageInfoObservable(
  datatable$: Observable<GqlDatatableAccessor | null | undefined>,
  defaultPageSize: number = 20
): Observable<TheSeamPageInfo> {
  return new Observable<TheSeamPageInfo>((subscriber: Subscriber<TheSeamPageInfo>) => {
    let prev: TheSeamPageInfo | null = null
    const handlePageInfo = (pageInfo: TheSeamPageInfo | null) => {
      if (!_isPageInfoSame(prev, pageInfo)) {
        if (pageInfo !== null) {
          subscriber.next(pageInfo)
        }
        prev = pageInfo
      }
    }

    const dtSub = datatable$.pipe(
      switchMap(dt => {
        if (!notNullOrUndefined(dt)) {
          handlePageInfo(null)
          return EMPTY
        }

        handlePageInfo(getPageInfo(dt, defaultPageSize))

        return dt.page.pipe(tap(p => handlePageInfo(p)))
      })
    ).subscribe()

    return () => {
      dtSub.unsubscribe()
    }
  })
}

function _isPageInfoSame(prev: TheSeamPageInfo | null, curr: TheSeamPageInfo | null): boolean {
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
