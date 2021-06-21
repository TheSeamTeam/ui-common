// import { isDevMode } from '@angular/core'
// import { combineLatest, defer, from, isObservable, Observable, of, Subject } from 'rxjs'
// import { catchError, distinctUntilChanged, finalize, map, shareReplay, skip, startWith, switchMap, take, tap } from 'rxjs/operators'

// import { DataFilterState } from '@theseam/ui-common/data-filters'
// import { DatatableComponent } from '@theseam/ui-common/datatable'
// import { notNullOrUndefined } from '@theseam/ui-common/utils'
// import { EmptyObject } from 'apollo-angular/types'

// import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'

// export type FilterStateMapperResult = { filter: { [name: string]: any }, variables: { [name: string]: any } } | null
// export type FilterStateMapper = (filterState: DataFilterState) => FilterStateMapperResult
// export interface FilterStateMappers { [filterName: string]: FilterStateMapper }

// export type SortsMapperResult = { [name: string]: any }[]
// export type SortsMapper = (sorts: { dir: 'desc' | 'asc', prop: string }[]) => SortsMapperResult

// export interface PageInfoMapperResult { skip: number, take: number }
// export type PageInfoMapper = (pageInfo: { offset: any, pageSize: any, limit: any, count: any }) => PageInfoMapperResult

// export const DEFAULT_PAGE_SIZE = 20

// export function pageDefaults(dt: any) {
//   return {
//     offset: (dt as any).ngxDatatable?.offset ?? 0,
//     pageSize: (dt as any).ngxDatatable?.pageSize ?? DEFAULT_PAGE_SIZE,
//     limit: (dt as any).ngxDatatable?.limit,
//     count: (dt as any).ngxDatatable?.count ?? 0
//   }
// }

// export function observeRowsWithGqlInputsHandling<TData, TRow, GqlVariables extends EmptyObject>(
//   queryRef: DatatableGraphQLQueryRef<TData, GqlVariables, TRow>,
//   rows: Observable<TRow[]>,
//   datatable: Observable<DatatableComponent | undefined> | Promise<DatatableComponent | undefined> | DatatableComponent,
//   extraVariables: Observable<Partial<GqlVariables>> | Promise<Partial<GqlVariables>> | Partial<GqlVariables>,
//   sortsMapper: SortsMapper,
//   filterStateMappers: FilterStateMappers
// ): Observable<TRow[]> {
//   const datatable$ = _resolveDatatable(datatable)
//   const extraVariables$ = _resolveGqlVariables<Partial<GqlVariables>>(extraVariables)

//   const pageInfo$ = _createPageInfoObservable(datatable$).pipe(map(_mapPageInfo))

//   const sorts$ = _createSortsObservable(datatable$).pipe(map(sortsMapper))

//   const filterInfo$ = _createFilterStatesObservable(datatable$).pipe(map(x => _mapFilterStates(x, filterStateMappers)))

//   const handleQueryInputs =  combineLatest([ extraVariables$, pageInfo$, sorts$, filterInfo$ ]).pipe(
//     tap(([ _extraVariables, pageInfo, sorts, filterInfo ]) => {
//       queryRef.setVariables({
//         ...(_extraVariables || {}),
//         ...pageInfo,
//         ...(sorts.length > 0 ? { order: sorts } : {}),
//         ...(filterInfo?.variables || {}),
//         ...(filterInfo?.filter ? { where: filterInfo.filter } : {})
//       } as any)
//     })
//   )

//   return defer(() => {
//     const _emitted = new Subject<boolean>()
//     const handlerSub = handleQueryInputs.pipe(
//       skip(1)
//     ).subscribe(() => _emitted.next(true))
//     return _emitted.pipe(
//       distinctUntilChanged(),
//       switchMap(() => rows),
//       finalize(() => handlerSub.unsubscribe())
//     )
//   }).pipe(
//     catchError(err => {
//       this._toastr.error(`There was a problem retrieving list data.`, 'Error')
//       console.error(err)
//       return of([] as TRow[])
//     }),
//     shareReplay({ bufferSize: 1, refCount: true })
//   )
// }

// function _resolveDatatable(
//   datatable: Observable<DatatableComponent | undefined> | Promise<DatatableComponent | undefined> | DatatableComponent
// ): Observable<DatatableComponent | undefined> {
//   if (isObservable(datatable)) {
//     return datatable.pipe(take(1))
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

// function _createPageInfoObservable(datatable$: Observable<DatatableComponent | undefined>) {
//   return datatable$.pipe(
//     switchMap(dt => {
//       if (!dt) { return of(pageDefaults({})) }
//       return dt.page.pipe(startWith(pageDefaults(dt)))
//     }),
//     shareReplay({ bufferSize: 1, refCount: true })
//   )
// }

// function _createSortsObservable(datatable$: Observable<DatatableComponent | undefined>) {
//   return datatable$.pipe(
//     switchMap(dt => dt ? dt.sort.pipe(map(v => v.sorts), startWith(dt.sorts)) : of([])),
//     shareReplay({ bufferSize: 1, refCount: true })
//   )
// }

// function _createFilterStatesObservable(datatable$: Observable<DatatableComponent | undefined>) {
//   return datatable$.pipe(
//     switchMap(dt => dt ? dt.filterStates : of([]))
//   )
// }

// function _mapFilterStates(
//   filterStates: DataFilterState[],
//   filterStateMappers: FilterStateMappers
// ): FilterStateMapperResult {
//   const results = filterStates
//     .map(filterState => {
//       if (filterStateMappers[filterState.name]) {
//         return filterStateMappers[filterState.name](filterState)
//       }
//       return null
//     })
//     .filter(notNullOrUndefined)

//   const filters = results
//     .map(r => r.filter)
//     .filter(notNullOrUndefined)

//   const variableObjs = results
//     .map(r => r.variables)
//     .filter(notNullOrUndefined)

//   const variables: { [name: string]: any } = {}
//   for (const v of variableObjs) {
//     const props = Object.keys(v)

//     if (isDevMode()) {
//       for (const p of props) {
//         if (notNullOrUndefined(variables[p]) && variables[p] !== v[p]) {
//           console.warn(`Multiple filters adding the same variable with a different result. This could cause unexpected results.`)
//           break
//         }
//       }
//     }

//     for (const p of props) {
//       variables[p] = v[p]
//     }
//   }

//   if (results.length > 0) {
//     return {
//       filter: { or: filters },
//       variables
//     }
//   }

//   return null
// }

// function _mapPageInfo(pageInfo: { offset: any, pageSize: any, limit: any, count: any }): PageInfoMapperResult {
//   const _skip = pageInfo.offset * pageInfo.pageSize
//   return {
//     skip: Math.max(Math.floor(_skip - (pageInfo.pageSize / 2)), 0),
//     take: (pageInfo.pageSize * 2)
//   }
// }
