import { BehaviorSubject, defer, from, isObservable, Observable, of, ReplaySubject, Subject, Subscriber } from 'rxjs'
import { auditTime, filter, finalize, map, share, shareReplay, skip, startWith, switchMap, take, tap } from 'rxjs/operators'

import { ApolloQueryResult, DocumentNode, NetworkStatus, TypedDocumentNode } from '@apollo/client/core'
import { hasProperty, isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'
import { QueryRef } from 'apollo-angular'
import { EmptyObject, WatchQueryOptions } from 'apollo-angular/types'

import { QueryProcessingConfig } from '../models'
import { DEFAULT_PAGE_SIZE } from './datatable-helpers'

export interface DatatableGraphQLDataMapperResult<TRow = EmptyObject> {
  rows: TRow[]

  /**
   * If data is paged, this is the total number of unpaged rows.
   */
  totalCount?: number
}

export type DatatableGraphQLDataMapper<TData, TRow = EmptyObject> = (data: TData) =>
    (DatatableGraphQLDataMapperResult<TRow> |
    Promise<DatatableGraphQLDataMapperResult<TRow>> |
    Observable<DatatableGraphQLDataMapperResult<TRow>>)

export type DatatableGraphQLVariables = {
  skip?: number
  take?: number
} & EmptyObject

/**
 * Partially wraps ApolloClient's QueryRef with some of our datatable boilerplate.
 *
 * TODO: Decide how to handle/display errors.
 */
export class DatatableGraphQLQueryRef<TData, TVariables extends DatatableGraphQLVariables = EmptyObject, TRow = EmptyObject> {

  private readonly _variablesSubject = new BehaviorSubject<TVariables>({} as TVariables)
  private readonly _observingChangesSubject = new BehaviorSubject<boolean>(false)

  /**
   * Temporary way of tracking total count when paging is disabled.
   */
  private _totalCount: number = DEFAULT_PAGE_SIZE

  private get _observingChanges(): boolean { return this._observingChangesSubject.value }
  private set _observingChanges(value: boolean) { this._observingChangesSubject.next(value) }

  private _variablesUpdatePending = false

  private readonly _valueChanges: Observable<ApolloQueryResult<TData>>

  public readonly loading$: Observable<boolean>

  public get updatesPollDelay(): number { return this._updatesPollDelay }
  public get variablesUpdatePending(): boolean { return this._variablesUpdatePending }

  constructor(
    /** Original ApolloClient's QueryRef. */
    private readonly _queryRef: QueryRef<TData, TVariables>,
    /**
     * How long to wait before refetching from an update to the query or variables.
     */
    private readonly _updatesPollDelay: number = 500
  ) {
    this._variablesSubject.next((this._queryRef as any).obsQuery.options.variables || {})
    // this._getValueChanges().subscribe(v => this._logNetworkStatus(v.networkStatus))

    this._valueChanges = defer(() => {
      // console.log('Observing value changes')
      const varChangesSub = this._variablesSubject.pipe(
        skip(1),
        tap(() => this._variablesUpdatePending = true),
        auditTime(this._updatesPollDelay),
        finalize(() => {
          // If the query stopped being observed before setting the pending
          // variables, set them now.
          if (this._variablesUpdatePending) {
            this.refetch()
            this._variablesUpdatePending = false
          }
        })
      ).subscribe(variables => {
        this._setVariablesImmediate(variables)
        // this.refetch()
        this._variablesUpdatePending = false
      })
      this._observingChanges = true

      return this._queryRef.valueChanges.pipe(
        tap(v => {
          console.log('v', v)
        }),
        filter(v => v.networkStatus === NetworkStatus.ready),
        finalize(() => {
          // console.log('Done observing value changes')
          varChangesSub.unsubscribe()
          this._observingChanges = false
        })
      )
    }).pipe(
      // share()
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.loading$ = this._observingChangesSubject.pipe(
      switchMap(observingChanges => {
        if (!observingChanges) {
          return of(false)
        }

        return this._valueChanges.pipe(
          map(result => result.loading),
          startWith(this._queryRef.getCurrentResult().loading),
          auditTime(0),
          shareReplay({ bufferSize: 1, refCount: true })
        )
      })
    )
  }

  private _logNetworkStatus(status: NetworkStatus) {
    switch (status) {
      case NetworkStatus.loading: console.log('%cNetworkStatus: ', 'color:limegreen', 'Loading'); break
      case NetworkStatus.setVariables: console.log('%cNetworkStatus: ', 'color:limegreen', 'SetVariables'); break
      case NetworkStatus.fetchMore: console.log('%cNetworkStatus: ', 'color:limegreen', 'FetchMore'); break
      case NetworkStatus.refetch: console.log('%cNetworkStatus: ', 'color:limegreen', 'Refetch'); break
      case NetworkStatus.poll: console.log('%cNetworkStatus: ', 'color:limegreen', 'Poll'); break
      case NetworkStatus.ready: console.log('%cNetworkStatus: ', 'color:limegreen', 'Ready'); break
      case NetworkStatus.error: console.log('%cNetworkStatus: ', 'color:limegreen', 'Error'); break
      default: console.log('%cNetworkStatus: ', 'color:red', 'Unknown')
    }
  }

  public rows(mapper: DatatableGraphQLDataMapper<TData, TRow>): Observable<TRow[]> {
    return this._rowsObservable(mapper)
  }

  private _rowsObservable(mapper: DatatableGraphQLDataMapper<TData, TRow>): Observable<TRow[]> {
    return new Observable<TRow[]>((subscriber: Subscriber<TRow[]>) => {
      // const rowsBufferSubject = new BehaviorSubject<TRow[]>([])

      let rowsBuffer: TRow[] = []
      // const rowsBufferSubject = new ReplaySubject<TRow[]>()
      const rowsBufferSubject = new Subject<TRow[]>()

      const querySub = this._valueChanges.pipe(
        switchMap(result => {
          if (result.data === undefined) {
            return of([])
          }

          return this._resolveRowMapper(mapper(result.data)).pipe(
            tap(mapperResult => {
              if (this._needsToRequeryWithAllRecords(mapperResult)) {
                this.patchVariables({ take: mapperResult.totalCount } as any)
              }

              if (hasProperty(mapperResult, 'totalCount')) {
                this._totalCount = mapperResult.totalCount
              }


              // let rows = rowsBufferSubject.value || []
              let rows = rowsBuffer || []

              const hasTotalCount = mapperResult.totalCount !== undefined && mapperResult.totalCount !== null

              // If the rows buffer is not the same size as the totalCount, create a
              // new buffer.
              //
              // TODO: Find out if this is resetting the buffer too eagerly.
              // ApolloClient may have a better solution.
              if (hasTotalCount) {
                if (mapperResult.totalCount !== rows.length) {
                  rows = new Array<TRow>(mapperResult.totalCount || 0)
                }

                let startIndex = this.getVariables().skip ?? 0
                if (this.getQueryProcessingConfig()?.disablePaging) {
                  startIndex = 0
                }

                // Insert rows into buffer location.
                rows.splice(startIndex, mapperResult.rows.length, ...mapperResult.rows)

                rows = [ ...rows ]
              } else {
                rows = [ ...mapperResult.rows ]
              }

              rowsBuffer = rows
              rowsBufferSubject.next(rows)
            })
          )
        })
      ).subscribe()

      const rowsSub = rowsBufferSubject.subscribe(subscriber)

      return () => {
        querySub.unsubscribe()
        rowsSub.unsubscribe()

        rowsBufferSubject.next([])
        rowsBufferSubject.complete()
      }
    })
  }

  private _needsToRequeryWithAllRecords(data: DatatableGraphQLDataMapperResult<TRow>): boolean {
    if (!(this.getQueryProcessingConfig()?.disablePaging)) {
      return false
    }

    return hasProperty(data, 'totalCount') &&
      hasProperty(data, 'rows') &&
      Array.isArray(data.rows) &&
      data.totalCount > data.rows.length &&
      this._totalCount !== data.totalCount
  }

  private _resolveRowMapper(
    mapperReturn: ReturnType<DatatableGraphQLDataMapper<TData, TRow>>
  ): Observable<DatatableGraphQLDataMapperResult<TRow>> {
    if (isObservable(mapperReturn)) {
      return mapperReturn.pipe(take(1))
    }

    return from(Promise.resolve(mapperReturn))
  }

  public getVariables(): TVariables {
    // The types aren't accurate or Apollo has a bug, so I had to use `any`.
    // return (this._queryRef as any).obsQuery.options.variables || {}

    // TODO: Look into debouncing our variable setting, while still depending on Apollo for managing them.
    return this._variablesSubject.value
  }

  private _setVariablesImmediate(variables: TVariables): Promise<void | ApolloQueryResult<TData>> {
    const _vars = this._withVariableOverrides(variables)
    return this._queryRef.setVariables(_vars || {} as TVariables)
  }

  private _patchVariablesImmediate(variables: Partial<TVariables>): Promise<void | ApolloQueryResult<TData>> {
    const _variables = {
      ...this.getVariables(),
      ...variables
    }

    const _vars = this._withVariableOverrides(_variables)
    return this._queryRef.setVariables(_vars || {} as TVariables)
  }

  public setVariables(variables: TVariables): void {
    this._variablesSubject.next(variables)
    if (!this._observingChanges) {
      this._setVariablesImmediate(variables)
    }
  }

  public patchVariables(variables: Partial<TVariables>): void {
    const _variables = {
      ...this.getVariables(),
      ...variables
    }

    this._variablesSubject.next(_variables)
    if (!this._observingChanges) {
      this._setVariablesImmediate(_variables)
    }
  }

  public refetch(variables?: TVariables): Promise<ApolloQueryResult<TData>> {
    const _vars = this._withVariableOverrides(variables)
    return this._queryRef.refetch(_vars)
  }

  public setQuery(query: DocumentNode | TypedDocumentNode<TData, TVariables>, triggerRefetch: boolean = false): void {
    this._queryRef.setOptions({ query })
    if (triggerRefetch) {
      // TODO: Consider refactoring the refetch process. I can't call Apollo's
      // refetch directly, because I want it to share the update triggered
      // polling delay with the setting of variables.
      // this._queryRef.refetch(this.getVariables())

      // Fake variables update to trigger a refetch that shares it's refetch delay.
      this.setVariables(this.getVariables())
    }
  }

  public getOptions(): WatchQueryOptions<TVariables, TData> | undefined {
    return (this._queryRef as any).obsQuery.options
  }

  public getQueryProcessingConfig(): QueryProcessingConfig | undefined {
    return this.getOptions()?.context?.queryProcessingConfig
  }

  private _withVariableOverrides(variables?: TVariables): TVariables | undefined {
    if (!notNullOrUndefined(variables) && !(this.getQueryProcessingConfig()?.disablePaging)) {
      return undefined
    }

    const _vars = { ...(variables || {}) } as TVariables
    if (this.getQueryProcessingConfig()?.disablePaging) {
      _vars.take = this._totalCount
    }
    return _vars
  }

}
