import { isDevMode } from '@angular/core'
import { combineLatest, defer, Observable, of, ReplaySubject, Subject, Subscriber } from 'rxjs'
import { catchError, distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators'

import { notNullOrUndefined, subscriberCount, wrapIntoObservable } from '@theseam/ui-common/utils'
import { EmptyObject } from 'apollo-angular/types'
import { SortItem } from '@theseam/ui-common/datatable'

import { GqlDatatableAccessor } from '../models'
import { createPageInfoObservable } from './create-page-info-observable'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'
import { FilterStateMapperResult, FilterStateMappers, mapFilterStates } from './map-filter-states'
import { mapPageInfo, PageInfoMapper, PageInfoMapperResult } from './map-page-info'
import { MapperContext } from './mapper-context'

export type SortsMapperResult = { [name: string]: any }[]
export type SortsMapper = (sorts: SortItem[], context: MapperContext)
  => (SortsMapperResult | Promise<SortsMapperResult> | Observable<SortsMapperResult>)

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

export function observeRowsWithGqlInputsHandling<TData, TRow, GqlVariables extends EmptyObject>(
  queryRef: DatatableGraphQLQueryRef<TData, GqlVariables, TRow>,
  rows: Observable<TRow[]>,
  datatable: Observable<GqlDatatableAccessor | undefined> | Promise<GqlDatatableAccessor | undefined> | GqlDatatableAccessor,
  extraVariables: Observable<Partial<GqlVariables>> | Promise<Partial<GqlVariables>> | Partial<GqlVariables>,
  sortsMapper: SortsMapper,
  filterStateMappers: FilterStateMappers
): Observable<TRow[]> {
  return new Observable<TRow[]>((subscriber: Subscriber<TRow[]>) => {
    const datatable$ = wrapIntoObservable(datatable)
    const extraVariables$ = wrapIntoObservable<Partial<GqlVariables>>(extraVariables)

    const context$ = extraVariables$.pipe(
      map(_extraVariables => {
        const context: MapperContext = {
          extraVariables: _extraVariables
        }

        return context
      }),
      shareReplay({ bufferSize: 1, refCount: true })
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
      tap(results => {
        queryRef.setVariables({
          ...(results.context || {}),
          ...results.pageInfo,
          ...(results.sorts.length > 0 ? { order: results.sorts } : {}),
          ...(results.filter?.variables || {}),
          ...(results.filter?.filter ? { where: results.filter.filter } : {})
        } as any)
      })
    )

    // const _emitSubject = new Subject<void>()

    // const queryVarsChangedSub = queryVariablesChanged$.pipe(
    //   switchMap(() => subscriberCount(rows, 'rows'))
    // ).subscribe(subscriber)
    const queryVarsChangedSub = queryVariablesChanged$.subscribe()

    const _sub = subscriberCount(rows, 'rows').subscribe(subscriber)

    return () => {
      queryVarsChangedSub.unsubscribe()
      _sub.unsubscribe()
    }
  })

  // const context$ = extraVariables$.pipe(
  //   map(_extraVariables => {
  //     const context: MapperContext = {
  //       extraVariables: _extraVariables
  //     }

  //     return context
  //   })
  // )

  // const datatableMappers: DatatableMappers = {
  //   pageInfo: mapPageInfo,
  //   sorts: sortsMapper,
  //   filters: filterStateMappers,
  // }

  // const datatableResults$ = _createDatatableResultsObservable(
  //   datatable$,
  //   datatableMappers,
  //   context$,
  // )

  // const queryVariablesChanged$ = datatableResults$.pipe(
  //   tap(results => {
  //     queryRef.setVariables({
  //       ...(results.extraVariables || {}),
  //       ...results.pageInfo,
  //       ...(results.sorts.length > 0 ? { order: results.sorts } : {}),
  //       ...(results.filterInfo?.variables || {}),
  //       ...(results.filterInfo?.filter ? { where: results.filterInfo.filter } : {})
  //     } as any)
  //   })
  // )

  // const handleQueryInputs =  combineLatest([ extraVariables$, pageInfo$ ]).pipe(
  //   switchMap(([ _extraVariables, pageInfo ]) => {
  //     // console.log('_extraVariables, pageInfo', _extraVariables, pageInfo)
  //     const context: MapperContext = {
  //       extraVariables: _extraVariables
  //     }

  //     return combineLatest([ sorts$, filterInfo$ ]).pipe(
  //       // map(([ sorts, filterInfo ]) => ({ extraVariables: _extraVariables, pageInfo, sorts, filterInfo }))
  //       map(([ sorts, filterInfo ]) => {
  //         // console.log('sorts, filterInfo', sorts, filterInfo)
  //         return { extraVariables: _extraVariables, pageInfo, sorts, filterInfo }
  //       })
  //     )
  //   }),
  //   tap(v => {
  //     // console.log('~~~', v)
  //     queryRef.setVariables({
  //       ...(v.extraVariables || {}),
  //       ...v.pageInfo,
  //       ...(v.sorts.length > 0 ? { order: v.sorts } : {}),
  //       ...(v.filterInfo?.variables || {}),
  //       ...(v.filterInfo?.filter ? { where: v.filterInfo.filter } : {})
  //     } as any)
  //   })
  // )

  // return defer(() => {
  //   const _emitted = new Subject<void>()
  //   const handlerSub = handleQueryInputs.pipe(
  //     // skip(1)
  //   // ).subscribe(() => _emitted.next())
  //   ).subscribe(() => {
  //     _emitted.next()
  //   })
  //   return _emitted.pipe(
  //     // tap(v => {
  //     //   console.log('emitted', v)
  //     // }),
  //     distinctUntilChanged(),
  //     switchMap(() => subscriberCount(rows, 'rows')),
  //     // tap(v => {
  //     //   console.log('emitting rows', v)
  //     // }),
  //     finalize(() => handlerSub.unsubscribe())
  //   )
  // }).pipe(
  //   // tap(v => {
  //   //   console.log('rows', v)
  //   // }),
  //   catchError(err => {
  //     console.error(err)
  //     return of([] as TRow[])
  //   }),
  //   shareReplay({ bufferSize: 1, refCount: true })
  // )
}

function _createSortsObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  return datatable$.pipe(
    // tap(v => console.log('sorts got dt', v)),
    switchMap(dt => dt
      ? dt.sort.pipe(map(v => v.sorts), startWith(dt.sorts)) // .pipe(tap(v => console.log('sorts 1', v)))
      : of([]) // .pipe(tap(v => console.log('sorts 2', v)))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  )
}

function _createFilterStatesObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  return datatable$.pipe(
    // tap(v => console.log('filters got dt', v)),
    switchMap(dt => dt
      ? dt.filterStates // .pipe(tap(v => console.log('filterStates 1', v)))
      : of([]) // .pipe(tap(v => console.log('filterStates 2', v)))
    ),
    // TODO: Remove when the datatable fixes the bug causing it to emit more than it should.
    distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y)),
  )
}

function _createDatatableResultsObservable(
  datatable$: Observable<GqlDatatableAccessor | undefined>,
  mappers: DatatableMappers,
  context$: Observable<MapperContext>,
): Observable<DatatableResults> {
  return new Observable<DatatableResults>((subscriber: Subscriber<DatatableResults>) => {
    const datatableSubject = new ReplaySubject<GqlDatatableAccessor | undefined>()

    const dtSub = datatable$.subscribe(
      dt => datatableSubject.next(dt),
      err => datatableSubject.error(err),
      () => datatableSubject.complete()
    )

    const ctxSub = context$.pipe(
      switchMap(context => {
        // TODO: Decide if the disabled paging feature will be reimplemented in a way
        // that it should be considered here. `_isPagingDisabled(queryRef)`
        const pageInfo$ = createPageInfoObservable(datatable$).pipe(
          map(info => mappers.pageInfo(info))
        )

        const sorts$ = _createSortsObservable(datatable$).pipe(
          switchMap(m => wrapIntoObservable(mappers.sorts(m, context)))
        )

        const filterInfo$ = _createFilterStatesObservable(datatable$).pipe(
          switchMap(x => mapFilterStates(x, mappers.filters, context)),
        )

        return combineLatest([
          pageInfo$,
          sorts$,
          filterInfo$,
        ]).pipe(
          map(([ pageInfo, sorts, filterInfo ]) => ({
            pageInfo,
            sorts,
            filter: filterInfo,
            context
          }))
        )
      })
    ).subscribe(subscriber)

    return () => {
      dtSub.unsubscribe()
      ctxSub.unsubscribe()
    }
  })
}

// function _isPagingDisabled<TData, TVariables, TRow>(queryRef: DatatableGraphQLQueryRef<TData, TVariables, TRow>): boolean {
//   return queryRef.getQueryProcessingConfig()?.disablePaging ?? false
// }
