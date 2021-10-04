import { isDevMode } from '@angular/core'
import { combineLatest, defer, EMPTY, from, isObservable, Observable, of, Subject } from 'rxjs'
import { catchError, concatMap, distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap, take, tap, toArray } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'
import { TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { notNullOrUndefined, subscriberCount, wrapIntoObservable } from '@theseam/ui-common/utils'
import { EmptyObject } from 'apollo-angular/types'

import { GqlDatatableAccessor } from '../models'
import { GqlDatatableFixture } from '../testing/gql-datatable-fixture'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'
import { FilterStateMapperResult, FilterStateMappers, mapFilterStates } from './map-filter-states'
import { MapperContext } from './mapper-context'


export type SortsMapperResult = { [name: string]: any }[]
export type SortsMapper = (sorts: { dir: 'desc' | 'asc', prop: string }[], context: MapperContext)
  => (SortsMapperResult | Promise<SortsMapperResult> | Observable<SortsMapperResult>)

export interface PageInfoMapperResult { skip: number, take: number }
export type PageInfoMapper = (pageInfo: TheSeamPageInfo) => PageInfoMapperResult

export function observeRowsWithGqlInputsHandling<TData, TRow, GqlVariables extends EmptyObject>(
  queryRef: DatatableGraphQLQueryRef<TData, GqlVariables, TRow>,
  rows: Observable<TRow[]>,
  datatable: Observable<GqlDatatableAccessor | undefined> | Promise<GqlDatatableAccessor | undefined> | GqlDatatableAccessor,
  extraVariables: Observable<Partial<GqlVariables>> | Promise<Partial<GqlVariables>> | Partial<GqlVariables>,
  sortsMapper: SortsMapper,
  filterStateMappers: FilterStateMappers
): Observable<TRow[]> {
  const datatable$ = wrapIntoObservable(datatable)
  const extraVariables$ = wrapIntoObservable<Partial<GqlVariables>>(extraVariables)

  const pageInfo$ = defer(() => {
    let firstEmit = true
    return _createPageInfoObservable(datatable$).pipe(
      switchMap(pageInfo => {
        if (!firstEmit && _isPagingDisabled(queryRef)) {
          return EMPTY
        }
        firstEmit = false
        return of(pageInfo)
      }),
      map(_mapPageInfo)
    )
  })

  const handleQueryInputs =  combineLatest([ extraVariables$, pageInfo$ ]).pipe(
    switchMap(([ _extraVariables, pageInfo ]) => {
      const context: MapperContext = {
        extraVariables: _extraVariables
      }

      const sorts$ = _createSortsObservable(datatable$).pipe(switchMap(m => wrapIntoObservable(sortsMapper(m, context))))
      const filterInfo$ = _createFilterStatesObservable(datatable$).pipe(
        switchMap(x => mapFilterStates(x, filterStateMappers, context)),
        // TODO: Remove when the datatable fixes the bug causing it to emit more than it should.
        distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y))
      )
      return combineLatest([ sorts$, filterInfo$ ]).pipe(
        // map(([ sorts, filterInfo ]) => ({ extraVariables: _extraVariables, pageInfo, sorts, filterInfo }))
        map(([ sorts, filterInfo ]) => {
          return { extraVariables: _extraVariables, pageInfo, sorts, filterInfo }
        })
      )
    }),
    tap(v => {
      queryRef.setVariables({
        ...(v.extraVariables || {}),
        ...v.pageInfo,
        ...(v.sorts.length > 0 ? { order: v.sorts } : {}),
        ...(v.filterInfo?.variables || {}),
        ...(v.filterInfo?.filter ? { where: v.filterInfo.filter } : {})
      } as any)
    })
  )

  return defer(() => {
    const _emitted = new Subject<void>()
    const handlerSub = handleQueryInputs.pipe(
      // skip(1)
    // ).subscribe(() => _emitted.next())
    ).subscribe(() => {
      _emitted.next()
    })
    return _emitted.pipe(
      tap(v => {
        console.log('emitted', v)
      }),
      distinctUntilChanged(),
      switchMap(() => subscriberCount(rows, 'rows')),
      tap(v => {
        console.log('emitting rows', v)
      }),
      finalize(() => handlerSub.unsubscribe())
    )
  }).pipe(
    tap(v => {
      console.log('rows', v)
    }),
    catchError(err => {
      console.error(err)
      return of([] as TRow[])
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )
}

function _createPageInfoObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  const t = datatable$.pipe(
    switchMap(dt => {
      if (!dt) { return of(GqlDatatableFixture.pageDefaults({})) }
      return dt.page.pipe(
        tap(v => {
          console.log('page', v)
        }),
        startWith(GqlDatatableFixture.pageDefaults(dt))
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )


  return subscriberCount(t, '_createPageInfoObservable')
}

function _createSortsObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  return datatable$.pipe(
    switchMap(dt => dt ? dt.sort.pipe(map(v => v.sorts), startWith(dt.sorts)) : of([])),
    shareReplay({ bufferSize: 1, refCount: true })
  )
}

function _createFilterStatesObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  return datatable$.pipe(
    switchMap(dt => dt ? dt.filterStates : of([]))
  )
}


function _mapPageInfo(pageInfo: TheSeamPageInfo): PageInfoMapperResult {
  const _skip = pageInfo.offset * pageInfo.pageSize
  return {
    skip: Math.max(Math.floor(_skip - (pageInfo.pageSize / 2)), 0),
    take: (pageInfo.pageSize * 2)
  }
}

function _isPagingDisabled<TData, TVariables, TRow>(queryRef: DatatableGraphQLQueryRef<TData, TVariables, TRow>): boolean {
  return queryRef.getQueryProcessingConfig()?.disablePaging ?? false
}
