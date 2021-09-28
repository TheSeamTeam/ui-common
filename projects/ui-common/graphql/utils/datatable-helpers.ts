import { isDevMode } from '@angular/core'
import { combineLatest, defer, EMPTY, from, isObservable, Observable, of, Subject } from 'rxjs'
import { catchError, concatMap, distinctUntilChanged, filter, finalize, map, shareReplay, startWith, switchMap, take, tap, toArray } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'
import { TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { notNullOrUndefined, subscriberCount, wrapIntoObservable } from '@theseam/ui-common/utils'
import { EmptyObject } from 'apollo-angular/types'

import { GqlDatatableAccessor } from '../models'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'

export interface MapperContext<TExtraVariables = EmptyObject> {
  extraVariables: TExtraVariables
}

export type FilterStateMapperResult = { filter: { [name: string]: any }, variables: { [name: string]: any } } | null
export type FilterStateMapper = (filterState: DataFilterState, context: MapperContext)
  => (FilterStateMapperResult | Promise<FilterStateMapperResult> | Observable<FilterStateMapperResult>)
export interface FilterStateMappers { [filterName: string]: FilterStateMapper }

export type SortsMapperResult = { [name: string]: any }[]
export type SortsMapper = (sorts: { dir: 'desc' | 'asc', prop: string }[], context: MapperContext)
  => (SortsMapperResult | Promise<SortsMapperResult> | Observable<SortsMapperResult>)

export interface PageInfoMapperResult { skip: number, take: number }
export type PageInfoMapper = (pageInfo: TheSeamPageInfo) => PageInfoMapperResult

export const DEFAULT_PAGE_SIZE = 20

export function pageDefaults(dt: any): TheSeamPageInfo {
  return {
    offset: (dt as any).ngxDatatable?.offset ?? 0,
    pageSize: (dt as any).ngxDatatable?.pageSize ?? DEFAULT_PAGE_SIZE,
    limit: (dt as any).ngxDatatable?.limit,
    count: (dt as any).ngxDatatable?.count ?? 0
  }
}

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
        switchMap(x => _mapFilterStates(x, filterStateMappers, context)),
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
    const _emitted = new Subject<boolean>()
    const handlerSub = handleQueryInputs.pipe(
      // skip(1)
    // ).subscribe(() => _emitted.next(true))
    ).subscribe(() => {
      _emitted.next(true)
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

// function _resolveDatatable(
//   datatable: Observable<GqlDatatableAccessor | undefined> | Promise<GqlDatatableAccessor | undefined> | GqlDatatableAccessor
// ): Observable<GqlDatatableAccessor | undefined> {
//   if (isObservable(datatable)) {
//     return datatable // .pipe(take(1))
//   }

//   return from(Promise.resolve(datatable))
// }

// function _resolveGqlVariables<GqlVariables>(
//   gqlVariables: Observable<GqlVariables> | Promise<GqlVariables> | GqlVariables
// ): Observable<GqlVariables> {
//   if (isObservable(gqlVariables)) {
//     return gqlVariables.pipe(take(1))
//   }

//   return from(Promise.resolve(gqlVariables))
// }

function _createPageInfoObservable(datatable$: Observable<GqlDatatableAccessor | undefined>) {
  const t = datatable$.pipe(
    switchMap(dt => {
      if (!dt) { return of(pageDefaults({})) }
      return dt.page.pipe(
        tap(v => {
          console.log('page', v)
        }),
        startWith(pageDefaults(dt))
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

async function _mapFilterStates(
  filterStates: DataFilterState[],
  filterStateMappers: FilterStateMappers,
  context: MapperContext
): Promise<FilterStateMapperResult> {
  const results = await from(filterStates).pipe(
    concatMap(filterState => {
      if (filterStateMappers[filterState.name]) {
        return wrapIntoObservable(filterStateMappers[filterState.name](filterState, context)).pipe(take(1))
      }
      return of(null)
    }),
    filter(notNullOrUndefined),
    toArray()
  ).toPromise()

  const filters = results
    .map(r => r.filter)
    .filter(notNullOrUndefined)

  const variableObjs = results
    .map(r => r.variables)
    .filter(notNullOrUndefined)

  const variables: { [name: string]: any } = {}
  for (const v of variableObjs) {
    const props = Object.keys(v)

    if (isDevMode()) {
      for (const p of props) {
        if (notNullOrUndefined(variables[p]) && variables[p] !== v[p]) {
          console.warn(`Multiple filters adding the same variable with a different result. This could cause unexpected results.`)
          break
        }
      }
    }

    for (const p of props) {
      variables[p] = v[p]
    }
  }

  if (results.length > 0) {
    return {
      filter: { or: filters },
      variables
    }
  }

  return null
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
