import {
  combineLatest,
  defer,
  EMPTY,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs'
import {
  auditTime,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'

import { wrapIntoObservable } from '@theseam/ui-common/utils'
import { SortItem } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor, EmptyObject } from '../models'
import { createPageInfoObservable } from './create-page-info-observable'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'
import { FilterStateMappers, mapFilterStates } from './map-filter-states'
import { mapPageInfo } from './map-page-info'
import { MapperContext } from './mapper-context'

export type SortsMapperResult = { [name: string]: any }[]
export type SortsMapper = (
  sorts: SortItem[],
  context: MapperContext,
) =>
  | SortsMapperResult
  | Promise<SortsMapperResult>
  | Observable<SortsMapperResult>

export function observeRowsWithGqlInputsHandling<
  TData,
  TRow,
  GqlVariables extends EmptyObject,
>(
  queryRef: DatatableGraphQLQueryRef<TData, GqlVariables, TRow>,
  rows: Observable<TRow[]>,
  datatable:
    | Observable<GqlDatatableAccessor | undefined>
    | Promise<GqlDatatableAccessor | undefined>
    | GqlDatatableAccessor,
  extraVariables:
    | Observable<Partial<GqlVariables>>
    | Promise<Partial<GqlVariables>>
    | Partial<GqlVariables>,
  sortsMapper: SortsMapper,
  filterStateMappers: FilterStateMappers,
): Observable<TRow[]> {
  const datatable$ = wrapIntoObservable(datatable)
  const extraVariables$ =
    wrapIntoObservable<Partial<GqlVariables>>(extraVariables)

  // Only emit page changes past the first when paging is enabled. When paging
  // is disabled, all data is already in the buffer so there is no need to
  // re-query on page changes.
  const pageInfo$ = defer(() => {
    let firstEmit = true
    return createPageInfoObservable(datatable$).pipe(
      switchMap((pageInfo) => {
        if (!firstEmit && _isPagingDisabled(queryRef)) {
          return EMPTY
        }
        firstEmit = false
        return of(pageInfo)
      }),
      map(mapPageInfo),
    )
  })

  // Combines extraVariables and pageInfo, then derives sorts and filter state.
  // auditTime(0) debounces rapid synchronous emissions (e.g. at startup) so
  // only one setVariables call is made per event-loop turn.
  const handleQueryInputs = combineLatest([extraVariables$, pageInfo$]).pipe(
    auditTime(0),
    switchMap(([_extraVariables, pageInfo]) => {
      const context: MapperContext = { extraVariables: _extraVariables }

      const sorts$ = _createSortsObservable(datatable$).pipe(
        switchMap((m) => wrapIntoObservable(sortsMapper(m, context))),
      )

      const filterInfo$ = _createFilterStatesObservable(datatable$).pipe(
        switchMap((x) => mapFilterStates(x, filterStateMappers, context)),
        // TODO: Remove when the datatable fixes the bug causing it to emit more than it should.
        distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
      )

      return combineLatest([sorts$, filterInfo$]).pipe(
        map(([sorts, filterInfo]) => ({
          extraVariables: _extraVariables,
          pageInfo,
          sorts,
          filterInfo,
        })),
      )
    }),
    tap((v) => {
      queryRef.setVariables({
        ...(v.extraVariables || {}),
        ...v.pageInfo,
        ...(v.sorts.length > 0 ? { order: v.sorts } : {}),
        ...(v.filterInfo?.variables || {}),
        ...(v.filterInfo?.filter ? { where: v.filterInfo.filter } : {}),
      } as any)
    }),
  )

  return defer(() => {
    // Observe the optional refresh-button patch attached externally to the
    // datatable instance. When the user triggers a refresh, refetch the data.
    let refreshBtnSub: Subscription = Subscription.EMPTY
    refreshBtnSub = datatable$
      .pipe(
        switchMap((dt) => {
          if (!dt || !(dt as any).__refreshPatch) {
            return EMPTY
          }
          return (dt as any).__refreshPatch.refreshTriggered.pipe(
            tap(() => queryRef.refetch(undefined, true)),
          )
        }),
      )
      .subscribe()

    // Bridge query-input changes to row emissions via a Subject so that the
    // rows observable is only subscribed once (on the first input change) and
    // then continues to receive updates as the live query produces new data.
    const _emitted = new Subject<boolean>()
    const handlerSub = handleQueryInputs.subscribe(() => _emitted.next(true))

    return _emitted.pipe(
      distinctUntilChanged(),
      switchMap(() => rows),
      finalize(() => {
        handlerSub.unsubscribe()
        refreshBtnSub.unsubscribe()
      }),
    )
  }).pipe(
    catchError((err) => {
      // eslint-disable-next-line no-console
      console.error(err)
      return of([] as TRow[])
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  )
}

function _createSortsObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
) {
  // NOTE: There is a bug in our datatable wrapper that isn't propagating
  // external sorting changes to the wrapped datatable component, which we observe
  // sort events from. This workaround observes our wrapper's internal column
  // change events, which emit all changes to columns that our datatable tracks,
  // and reads sorts from our wrapper when externalSorting is enabled.
  const _observeSortsWorkaround = (
    dt: GqlDatatableAccessor,
  ): Observable<SortItem[]> => {
    if (!(dt as any)._columnsAlterationsManager) {
      // Fallback for environments (e.g. tests) where the internal manager
      // is not present.
      return dt.sort.pipe(
        map((v) => v.sorts),
        startWith(dt.sorts),
      )
    }
    return (dt as any)._columnsAlterationsManager.changes.pipe(
      map(() => (dt.externalSorting ? (dt as any)._sorts : dt.sorts)),
      startWith(dt.externalSorting ? (dt as any)._sorts : dt.sorts),
    )
  }

  return datatable$.pipe(
    switchMap((dt) => (dt ? _observeSortsWorkaround(dt) : of([]))),
    shareReplay({ bufferSize: 1, refCount: true }),
  )
}

function _createFilterStatesObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
) {
  return datatable$.pipe(switchMap((dt) => (dt ? dt.filterStates : of([]))))
}

function _isPagingDisabled<TData, GqlVariables extends EmptyObject, TRow>(
  queryRef: DatatableGraphQLQueryRef<TData, GqlVariables, TRow>,
): boolean {
  return queryRef.getQueryProcessingConfig()?.disablePaging ?? false
}
