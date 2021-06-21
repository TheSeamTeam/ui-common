// import { BehaviorSubject, defer, from, isObservable, Observable, of, Subscriber } from 'rxjs'
// import { auditTime, finalize, map, share, shareReplay, skip, switchMap, take, tap } from 'rxjs/operators'

// import { ApolloQueryResult, DocumentNode, NetworkStatus, TypedDocumentNode } from '@apollo/client/core'
// import { QueryRef } from 'apollo-angular'
// import { EmptyObject } from 'apollo-angular/types'

// export interface DatatableGraphQLDataMapperResult<TRow = EmptyObject> {
//   rows: TRow[]

//   /**
//    * If data is paged, this is the total number of unpaged rows.
//    */
//   totalCount?: number
// }

// export type DatatableGraphQLDataMapper2<TData, TRow = EmptyObject> = (data: TData) =>
//     (DatatableGraphQLDataMapperResult<TRow> |
//     Promise<DatatableGraphQLDataMapperResult<TRow>> |
//     Observable<DatatableGraphQLDataMapperResult<TRow>>)

// export type DatatableGraphQLVariables = {
//   skip?: number
//   take?: number
// } & EmptyObject

// /**
//  * Partially wraps ApolloClient's QueryRef with some of our datatable boilerplate.
//  *
//  * TODO: Decide how to handle/display errors.
//  *
//  * NOTE: This will get moved to '@theseam/ui-common' and most likely change a lot.
//  */
// export class DatatableGraphQLQueryRef<TData, TVariables extends DatatableGraphQLVariables = EmptyObject, TRow = EmptyObject> {

//   private readonly _variablesSubject = new BehaviorSubject<TVariables>({} as TVariables)
//   private readonly _observingChangesSubject = new BehaviorSubject<boolean>(false)

//   private get _observingChanges(): boolean { return this._observingChangesSubject.value }
//   private set _observingChanges(value: boolean) { this._observingChangesSubject.next(value) }

//   private _variablesUpdatePending = false

//   private readonly _valueChanges: Observable<ApolloQueryResult<TData>>

//   public readonly loading$: Observable<boolean>

//   constructor(
//     /** Original ApolloClient's QueryRef. */
//     private readonly _queryRef: QueryRef<TData, TVariables>,
//     /**
//      * How long to wait before refetching from an update to the query or variables.
//      */
//     private readonly _updatesPollDelay: number = 500
//   ) {
//     this._variablesSubject.next((this._queryRef as any).obsQuery.options.variables || {})
//     // this._getValueChanges().subscribe(v => this._logNetworkStatus(v.networkStatus))

//     this._valueChanges = defer(() => {
//       // console.log('Observing value changes')
//       const varChangesSub = this._variablesSubject.pipe(
//         skip(1),
//         tap(() => this._variablesUpdatePending = true),
//         auditTime(this._updatesPollDelay),
//         finalize(() => {
//           // If the query stopped being observed before setting the pending
//           // variables, set them now.
//           if (this._variablesUpdatePending) {
//             this.refetch()
//             this._variablesUpdatePending = false
//           }
//         })
//       ).subscribe(variables => {
//         this._setVariablesImmediate(variables)
//         this.refetch()
//         this._variablesUpdatePending = false
//       })
//       this._observingChanges = true

//       return this._queryRef.valueChanges.pipe(
//         finalize(() => {
//           // console.log('Done observing value changes')
//           varChangesSub.unsubscribe()
//           this._observingChanges = false
//         })
//       )
//     }).pipe(
//       share()
//     )

//     this.loading$ = this._observingChangesSubject.pipe(
//       switchMap(observingChanges => {
//         if (!observingChanges) {
//           return of(false)
//         }

//         return this._valueChanges.pipe(
//           map(result => result.loading),
//           shareReplay({ bufferSize: 1, refCount: true })
//         )
//       })
//     )
//   }

//   private _logNetworkStatus(status: NetworkStatus) {
//     switch (status) {
//       case NetworkStatus.loading: console.log('%cNetworkStatus: ', 'color:limegreen', 'Loading'); break
//       case NetworkStatus.setVariables: console.log('%cNetworkStatus: ', 'color:limegreen', 'SetVariables'); break
//       case NetworkStatus.fetchMore: console.log('%cNetworkStatus: ', 'color:limegreen', 'FetchMore'); break
//       case NetworkStatus.refetch: console.log('%cNetworkStatus: ', 'color:limegreen', 'Refetch'); break
//       case NetworkStatus.poll: console.log('%cNetworkStatus: ', 'color:limegreen', 'Poll'); break
//       case NetworkStatus.ready: console.log('%cNetworkStatus: ', 'color:limegreen', 'Ready'); break
//       case NetworkStatus.error: console.log('%cNetworkStatus: ', 'color:limegreen', 'Error'); break
//       default: console.log('%cNetworkStatus: ', 'color:red', 'Unknown')
//     }
//   }

//   public rows(mapper: DatatableGraphQLDataMapper2<TData, TRow>): Observable<TRow[]> {
//     return this._rowsObservable(mapper)
//   }

//   private _rowsObservable(mapper: DatatableGraphQLDataMapper2<TData, TRow>): Observable<TRow[]> {
//     return new Observable<TRow[]>((subscriber: Subscriber<TRow[]>) => {
//       const rowsBufferSubject = new BehaviorSubject<TRow[]>([])

//       const querySub = this._valueChanges.pipe(
//         switchMap(result => {
//           if (result.data === undefined) {
//             return of()
//           }

//           return this._resolveRowMapper(mapper(result.data)).pipe(
//             tap(mapperResult => {
//               let rows = rowsBufferSubject.value || []

//               const hasTotalCount = mapperResult.totalCount !== undefined && mapperResult.totalCount !== null

//               // If the rows buffer is not the same size as the totalCount, create a
//               // new buffer.
//               //
//               // TODO: Find out if this is resetting the buffer too eagerly.
//               // ApolloClient may have a better solution.
//               if (hasTotalCount) {
//                 if (mapperResult.totalCount !== rows.length) {
//                   rows = new Array<TRow>(mapperResult.totalCount || 0)
//                 }

//                 const startIndex = this.getVariables().skip ?? 0

//                 // Insert rows into buffer location.
//                 rows.splice(startIndex, mapperResult.rows.length, ...mapperResult.rows)

//                 rows = [ ...rows ]
//               } else {
//                 rows = [ ...mapperResult.rows ]
//               }

//               rowsBufferSubject.next(rows)
//             })
//           )
//         })
//       ).subscribe()

//       const rowsSub = rowsBufferSubject.subscribe(subscriber)

//       return () => {
//         querySub.unsubscribe()
//         rowsSub.unsubscribe()

//         rowsBufferSubject.next([])
//         rowsBufferSubject.complete()
//       }
//     })
//   }

//   private _resolveRowMapper(
//     mapperReturn: ReturnType<DatatableGraphQLDataMapper2<TData, TRow>>
//   ): Observable<DatatableGraphQLDataMapperResult<TRow>> {
//     if (isObservable(mapperReturn)) {
//       return mapperReturn.pipe(take(1))
//     }

//     return from(Promise.resolve(mapperReturn))
//   }

//   public getVariables(): TVariables {
//     // The types aren't accurate or Apollo has a bug, so I had to use `any`.
//     // return (this._queryRef as any).obsQuery.options.variables || {}

//     // TODO: Look into debouncing our variable setting, while still depending on Apollo for managing them.
//     return this._variablesSubject.value
//   }

//   private _setVariablesImmediate(variables: TVariables): Promise<void | ApolloQueryResult<TData>> {
//     return this._queryRef.setVariables(variables)
//   }

//   private _patchVariablesImmediate(variables: Partial<TVariables>): Promise<void | ApolloQueryResult<TData>> {
//     const _variables = {
//       ...this.getVariables(),
//       ...variables
//     }
//     return this._queryRef.setVariables(_variables)
//   }

//   public setVariables(variables: TVariables): void {
//     this._variablesSubject.next(variables)
//     if (!this._observingChanges) {
//       this._setVariablesImmediate(variables)
//     }
//   }

//   public patchVariables(variables: Partial<TVariables>): void {
//     const _variables = {
//       ...this.getVariables(),
//       ...variables
//     }

//     this._variablesSubject.next(_variables)
//     if (!this._observingChanges) {
//       this._setVariablesImmediate(_variables)
//     }
//   }

//   public refetch(variables?: TVariables): Promise<ApolloQueryResult<TData>> {
//     return this._queryRef.refetch(variables)
//   }

//   public setQuery(query: DocumentNode | TypedDocumentNode<TData, TVariables>, triggerRefetch: boolean = false): void {
//     this._queryRef.setOptions({ query })
//     if (triggerRefetch) {
//       // TODO: Consider refactoring the refetch process. I can't call Apollo's
//       // refetch directly, because I want it to share the update triggered
//       // polling delay with the setting of variables.
//       // this._queryRef.refetch(this.getVariables())

//       // Fake variables update to trigger a refetch that shares it's refetch delay.
//       this.setVariables(this.getVariables())
//     }
//   }

// }
