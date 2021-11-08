import { EMPTY, Observable, Subject, Subscriber } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'

import { TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { GqlDatatableAccessor } from '../models/gql-datatable-accessor'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'
import { getPageInfo } from './get-page-info'

// export interface PageInfoObservableOptions {
//   /**
//    * By default the observable will compare the page of each datatable emitted
//    * with the last page info from the previous datatable. It is done this way to
//    * avoid unecessary page info events, because we assume the datatable is only provided as a source of page
//    */
//   resetDiffOnDatatableChange: boolean
// }

export function createPageInfoObservable(
  datatable$: Observable<GqlDatatableAccessor | null | undefined>,
  defaultPageSize: number = 20
): Observable<TheSeamPageInfo> {
  return new Observable<TheSeamPageInfo>((subscriber: Subscriber<TheSeamPageInfo>) => {
    const pageInfoSubject = new Subject<TheSeamPageInfo>()

    const dtSub = datatable$.pipe(
      switchMap(dt => {
        if (!notNullOrUndefined(dt)) {
          return EMPTY
        }

        pageInfoSubject.next(getPageInfo(dt, defaultPageSize))

        return dt.page.pipe(
          tap(p => pageInfoSubject.next(p))
        )
      })
    ).subscribe()

    let prev: TheSeamPageInfo | null = null
    const piSub = pageInfoSubject.subscribe(pageInfo => {
      if (!_isPageInfoSame(prev, pageInfo)) {
        subscriber.next(pageInfo)
        prev = pageInfo
      }
    })

    return () => {
      dtSub.unsubscribe()
      piSub.unsubscribe()
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
