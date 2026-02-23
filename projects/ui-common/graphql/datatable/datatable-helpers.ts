import { combineLatest, Observable, of, ReplaySubject, Subscriber } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'

import { subscriberCount, wrapIntoObservable } from '@theseam/ui-common/utils'
import { SortItem } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor, EmptyObject } from '../models'
import { createPageInfoObservable } from './create-page-info-observable'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'
import {
  FilterStateMapperResult,
  FilterStateMappers,
  mapFilterStates,
} from './map-filter-states'
import {
  mapPageInfo,
  PageInfoMapper,
  PageInfoMapperResult,
} from './map-page-info'
import { MapperContext } from './mapper-context'

export type SortsMapperResult = { [name: string]: any }[]
export type SortsMapper = (
  sorts: SortItem[],
  context: MapperContext,
) =>
  | SortsMapperResult
  | Promise<SortsMapperResult>
  | Observable<SortsMapperResult>

interface DatatableResults {
  pageInfo: PageInfoMapperResult
  sorts: SortsMapperResult
  filter: FilterStateMapperResult
  context: MapperContext
}

interface DatatableMappers {
  pageInfo: PageInfoMapper
  sorts: SortsMapper
  filters: FilterStateMappers
}

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
  return new Observable<TRow[]>((subscriber: Subscriber<TRow[]>) => {
    const datatable$ = wrapIntoObservable(datatable)
    const extraVariables$ =
      wrapIntoObservable<Partial<GqlVariables>>(extraVariables)

    const context$ = extraVariables$.pipe(
      map((_extraVariables) => {
        const context: MapperContext = {
          extraVariables: _extraVariables,
        }

        return context
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    )

    const datatableMappers: DatatableMappers = {
      pageInfo: mapPageInfo,
      sorts: sortsMapper,
      filters: filterStateMappers,
    }

    const datatableResults$ = _createDatatableResultsObservable(
      datatable$,
      datatableMappers,
      context$,
    )

    const queryVariablesChanged$ = datatableResults$.pipe(
      tap((results) => {
        queryRef.setVariables({
          ...(results.context.extraVariables || {}),
          ...results.pageInfo,
          ...(results.sorts.length > 0 ? { order: results.sorts } : {}),
          ...(results.filter?.variables || {}),
          ...(results.filter?.filter ? { where: results.filter.filter } : {}),
        } as any)
      }),
    )

    const queryVarsChangedSub = queryVariablesChanged$.subscribe()

    const _sub = subscriberCount(rows, 'rows').subscribe(subscriber)

    return () => {
      queryVarsChangedSub.unsubscribe()
      _sub.unsubscribe()
    }
  })
}

function _createSortsObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
) {
  return datatable$.pipe(
    switchMap((dt) =>
      dt
        ? dt.sort.pipe(
            map((v) => v.sorts),
            startWith(dt.sorts),
          )
        : of([]),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  )
}

function _createFilterStatesObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
) {
  return datatable$.pipe(
    switchMap((dt) => (dt ? dt.filterStates : of([]))),
    // TODO: Remove when the datatable fixes the bug causing it to emit more than it should.
    distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
  )
}

function _createDatatableResultsObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
  mappers: DatatableMappers,
  context$: Observable<MapperContext>,
): Observable<DatatableResults> {
  return new Observable<DatatableResults>(
    (subscriber: Subscriber<DatatableResults>) => {
      const datatableSubject = new ReplaySubject<
        GqlDatatableAccessor | undefined
      >()

      const dtSub = datatable$.subscribe(
        (dt) => datatableSubject.next(dt),
        (err) => datatableSubject.error(err),
        () => datatableSubject.complete(),
      )

      const ctxSub = context$
        .pipe(
          switchMap((context) => {
            // TODO: Decide if the disabled paging feature will be reimplemented in a way
            // that it should be considered here. `_isPagingDisabled(queryRef)`
            const pageInfo$ = createPageInfoObservable(datatable$).pipe(
              map((info) => mappers.pageInfo(info)),
            )

            const sorts$ = _createSortsObservable(datatable$).pipe(
              switchMap((m) => wrapIntoObservable(mappers.sorts(m, context))),
            )

            const filterInfo$ = _createFilterStatesObservable(datatable$).pipe(
              switchMap((x) => mapFilterStates(x, mappers.filters, context)),
            )

            return combineLatest([pageInfo$, sorts$, filterInfo$]).pipe(
              map(([pageInfo, sorts, filterInfo]) => ({
                pageInfo,
                sorts,
                filter: filterInfo,
                context,
              })),
            )
          }),
        )
        .subscribe(subscriber)

      return () => {
        dtSub.unsubscribe()
        ctxSub.unsubscribe()
      }
    },
  )
}
