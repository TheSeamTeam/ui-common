import {
  BehaviorSubject,
  defer,
  from,
  isObservable,
  Observable,
  of,
  Subject,
  Subscriber,
} from 'rxjs'
import {
  auditTime,
  filter,
  finalize,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'

import {
  ApolloQueryResult,
  DocumentNode,
  NetworkStatus,
  TypedDocumentNode,
} from '@apollo/client/core'
import {
  hasProperty,
  notNullOrUndefined,
  withoutProperties,
} from '@theseam/ui-common/utils'

// `isNetworkRequestInFlight` is only exported from the ES module subpath
// `@apollo/client/core/networkStatus`, which can't be loaded by Jest's CJS
// transform. Reimplementing it here keeps the logic accessible in tests.
function isNetworkRequestInFlight(networkStatus?: NetworkStatus): boolean {
  return networkStatus ? networkStatus < NetworkStatus.ready : false
}
import { QueryRef } from 'apollo-angular'
import { WatchQueryOptions } from 'apollo-angular'
import { GraphQLFormattedError } from 'graphql'

import { QueryProcessingConfig, EmptyObject } from '../models'
import { DEFAULT_PAGE_SIZE } from './get-page-info'

export interface DatatableGraphQLDataMapperResult<TRow = EmptyObject> {
  rows: TRow[]

  /**
   * If data is paged, this is the total number of unpaged rows.
   */
  totalCount?: number
}

export type DatatableGraphQLDataMapper<TData, TRow = EmptyObject> = (
  data: TData,
) =>
  | DatatableGraphQLDataMapperResult<TRow>
  | Promise<DatatableGraphQLDataMapperResult<TRow>>
  | Observable<DatatableGraphQLDataMapperResult<TRow>>

export type DatatableGraphQLVariables = {
  skip?: number
  take?: number
} & EmptyObject

export type DatatableGraphQLErrorHandler = (
  error: readonly GraphQLFormattedError[],
) => void

/**
 * Maximum number of error recovery attempts before throwing.
 */
export const MAX_ERROR_RECOVERY_ATTEMPTS = 10

/**
 * Partially wraps ApolloClient's QueryRef with datatable paging, loading
 * state, error handling, and debounced variable updates.
 */
export class DatatableGraphQLQueryRef<
  TData,
  TVariables extends DatatableGraphQLVariables = EmptyObject,
  TRow = EmptyObject,
> {
  private readonly _variablesSubject = new BehaviorSubject<TVariables>(
    {} as TVariables,
  )
  private readonly _observingChangesSubject = new BehaviorSubject<boolean>(
    false,
  )
  private readonly _errorSubject = new Subject<
    readonly GraphQLFormattedError[]
  >()
  /**
   * Used to manually trigger a pending/loading state when we know a request is
   * coming but Apollo hasn't started it yet (e.g. after setVariables resolves to
   * a non-paging variable change while a request is already in-flight).
   */
  private readonly _manualPendingSubject = new BehaviorSubject<boolean>(false)
  private readonly _needToRequerySubject = new Subject<boolean>()

  /**
   * Temporary way of tracking total count when paging is disabled.
   */
  private _totalCount: number = DEFAULT_PAGE_SIZE

  private get _observingChanges(): boolean {
    return this._observingChangesSubject.value
  }
  private set _observingChanges(value: boolean) {
    this._observingChangesSubject.next(value)
  }

  private _variablesUpdatePending = false

  private readonly _valueChanges: Observable<ApolloQueryResult<TData>>

  public readonly loading$: Observable<boolean>

  /**
   * Emits whenever the query variables change.
   */
  public readonly variables$ = this._variablesSubject.asObservable()

  /**
   * Emits when a GraphQL error occurs.
   *
   * If nothing is subscribed to this, the `_defaultErrorHandler` is used
   * (if provided). Once subscribed, the subscriber is responsible for
   * handling the error.
   */
  public readonly error$ = this._errorSubject.asObservable()

  public get updatesPollDelay(): number {
    return this._updatesPollDelay
  }
  public get variablesUpdatePending(): boolean {
    return this._variablesUpdatePending
  }

  constructor(
    /** Original ApolloClient's QueryRef. */
    private readonly _queryRef: QueryRef<TData, TVariables>,
    /**
     * How long to wait (ms) before applying variable changes and refetching.
     */
    private readonly _updatesPollDelay: number = 500,
    /**
     * Default error handler used when no subscriber is listening to `error$`.
     */
    private readonly _defaultErrorHandler?: DatatableGraphQLErrorHandler,
  ) {
    this._variablesSubject.next(
      (this._queryRef as any).obsQuery.options.variables || {},
    )

    // Tracks whether the loading overlay should be held open until we know
    // whether the first response will trigger a follow-up requery (e.g. when
    // disablePaging is on and we first probe for totalCount). This prevents the
    // loading overlay from flickering off and back on.
    let hasEmittedTriggered = false
    const hasEmittedSubject = new BehaviorSubject<boolean>(false)

    const setHasEmitted = () => {
      if (hasEmittedTriggered) {
        return
      }
      hasEmittedTriggered = true
      const sub = this._needToRequerySubject.pipe(take(1)).subscribe(() => {
        hasEmittedSubject.next(true)
        sub.unsubscribe()
      })
    }

    this._valueChanges = defer(() => {
      let prev: Omit<TVariables, 'skip' | 'take'> | undefined
      const varChangesSub = this._variablesSubject
        .pipe(
          skip(1),
          tap(() => {
            this._variablesUpdatePending = true
          }),
          auditTime(this._updatesPollDelay),
          finalize(() => {
            // If the query stopped being observed before the debounce fired,
            // apply the pending variables now.
            if (this._variablesUpdatePending) {
              this.refetch()
              this._variablesUpdatePending = false
            }
          }),
        )
        .subscribe((variables) => {
          this._setVariablesImmediate(variables)
          const current = withoutProperties(this.getVariables(), [
            'skip',
            'take',
          ])
          const isVarsChanged =
            prev === undefined ||
            JSON.stringify(prev) !== JSON.stringify(current)
          prev = current as any
          this._variablesUpdatePending = false
          // When the non-paging variables change while Apollo is already
          // in setVariables state, manually signal a pending load so the
          // loading overlay doesn't disappear until the response arrives.
          if (
            isVarsChanged &&
            this._queryRef.getCurrentResult().networkStatus ===
              NetworkStatus.setVariables
          ) {
            this._manualPendingSubject.next(true)
          }
        })

      let repeatedErrors = 0
      this._observingChanges = true
      return this._queryRef.valueChanges.pipe(
        // Once a response lands (not in-flight), begin tracking whether the
        // initial load has truly completed (accounting for disablePaging requery).
        tap((v) =>
          !isNetworkRequestInFlight(v.networkStatus)
            ? setHasEmitted()
            : undefined,
        ),
        // Guard against infinite error loops when polling / retrying.
        tap((v) => {
          if (v.networkStatus === NetworkStatus.error) {
            repeatedErrors++
            if (repeatedErrors >= MAX_ERROR_RECOVERY_ATTEMPTS) {
              throw Error('Max error recovery attempts reached.')
            }
          } else if (v.networkStatus === NetworkStatus.ready) {
            repeatedErrors = 0
          }
        }),
        finalize(() => {
          varChangesSub.unsubscribe()
          this._observingChanges = false
        }),
      )
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    this.loading$ = this._observingChangesSubject.pipe(
      switchMap((observingChanges) => {
        if (!observingChanges) {
          return of(false)
        }

        return this._valueChanges.pipe(
          map((result) => result.loading),
          startWith(this._queryRef.getCurrentResult().loading),
          tap((loading) => {
            if (!loading) {
              this._manualPendingSubject.next(false)
            }
          }),
          // Swap the actual loading flag for the manual pending flag so that
          // we can hold the loading state open when needed.
          switchMap(() => this._manualPendingSubject),
          auditTime(0),
          shareReplay({ bufferSize: 1, refCount: true }),
        )
      }),
      // Keep loading=true until we've confirmed the first full load cycle
      // (including any disablePaging requery).
      switchMap((v) =>
        hasEmittedSubject.pipe(map((hasEmitted) => (hasEmitted ? v : true))),
      ),
    )
  }

  /**
   * Returns an observable of mapped rows from the query result.
   *
   * The mapper transforms the raw GraphQL response data into the row format
   * the datatable expects, and provides the total count for pagination.
   *
   * @example
   * ```typescript
   * this.rows$ = this._queryRef.rows((data) => ({
   *   rows: data.items.items,
   *   totalCount: data.items.totalCount,
   * }))
   * ```
   */
  public rows(
    mapper: DatatableGraphQLDataMapper<TData, TRow>,
  ): Observable<TRow[]> {
    return this._rowsObservable(mapper)
  }

  private _rowsObservable(
    mapper: DatatableGraphQLDataMapper<TData, TRow>,
  ): Observable<TRow[]> {
    return new Observable<TRow[]>((subscriber: Subscriber<TRow[]>) => {
      const rowsBufferSubject = new BehaviorSubject<TRow[]>([])

      const querySub = this._valueChanges
        .pipe(
          filter((result) => !isNetworkRequestInFlight(result.networkStatus)),
          switchMap((result) => {
            if (result.data === undefined) {
              return of()
            }

            // Capture the skip offset *before* any variable changes that the
            // mapper might trigger (e.g. patchVariables for disablePaging).
            const querySkip = this._getVariablesFromQueryRef().skip

            const _result = this._handleResult(result)
            return this._resolveRowMapper(mapper(_result.data)).pipe(
              tap((mapperResult) => {
                const needsToRequery =
                  this._needsToRequeryWithAllRecords(mapperResult)
                if (needsToRequery) {
                  this.patchVariables({ take: mapperResult.totalCount } as any)
                }
                this._needToRequerySubject.next(needsToRequery)

                if (hasProperty(mapperResult, 'totalCount')) {
                  this._totalCount = mapperResult.totalCount
                }

                let rows = rowsBufferSubject.value || []

                const hasTotalCount =
                  mapperResult.totalCount !== undefined &&
                  mapperResult.totalCount !== null

                // If the rows buffer is not the same size as totalCount, create
                // a fresh buffer (sparse array — unfilled slots are undefined,
                // which is what checkRecordsHaveValue expects).
                if (hasTotalCount) {
                  if (mapperResult.totalCount !== rows.length) {
                    rows = new Array<TRow>(mapperResult.totalCount || 0)
                  }

                  let startIndex = querySkip ?? 0
                  if (this.getQueryProcessingConfig()?.disablePaging) {
                    startIndex = 0
                  }

                  // Insert rows into the correct buffer positions.
                  for (let i = 0; i < mapperResult.rows.length; i++) {
                    rows[startIndex + i] = mapperResult.rows[i]
                  }

                  rows = [...rows]
                } else {
                  rows = [...mapperResult.rows]
                }

                // ngx-datatable does row lookups in a WeakMap and my assumption
                // is that the pre-allocated empty objects seem to be getting
                // recognized as the same object, so to avoid that, we add a
                // unique property to each row.
                rows = rows.map((v, i) => ({
                  ...v,
                  __dt_id: `row-${i}`,
                }))

                rowsBufferSubject.next(rows)
              }),
            )
          }),
        )
        .subscribe()

      const rowsSub = rowsBufferSubject.subscribe(subscriber)

      return () => {
        querySub.unsubscribe()
        rowsSub.unsubscribe()

        rowsBufferSubject.next([])
        rowsBufferSubject.complete()
      }
    })
  }

  /**
   * Reads the result and returns it unchanged if no errors.
   *
   * On errors: emits them via `error$` and replaces any `null` data properties
   * with an empty collection shape `{ items: [], totalCount: 0 }` so mapper
   * functions can run safely without special-casing the error path.
   */
  private _handleResult(
    result: ApolloQueryResult<TData>,
  ): ApolloQueryResult<TData> {
    if (!result.errors || result.errors.length === 0) return result

    this._emitError(result.errors)

    const defaultDataPropValue = { items: [], totalCount: 0 }
    const data = Object.keys(result.data as any).reduce((acc, key) => {
      ;(acc as any)[key] =
        (result.data as any)[key] === null
          ? defaultDataPropValue
          : (result.data as any)[key]
      return acc
    }, {} as TData)

    return { ...result, data }
  }

  private _needsToRequeryWithAllRecords(
    data: DatatableGraphQLDataMapperResult<TRow>,
  ): boolean {
    if (!this.getQueryProcessingConfig()?.disablePaging) {
      return false
    }

    return (
      hasProperty(data, 'totalCount') &&
      hasProperty(data, 'rows') &&
      Array.isArray(data.rows) &&
      data.totalCount > data.rows.length &&
      this._totalCount !== data.totalCount
    )
  }

  private _resolveRowMapper(
    mapperReturn: ReturnType<DatatableGraphQLDataMapper<TData, TRow>>,
  ): Observable<DatatableGraphQLDataMapperResult<TRow>> {
    if (isObservable(mapperReturn)) {
      return mapperReturn.pipe(take(1))
    }

    return from(Promise.resolve(mapperReturn))
  }

  public getVariables(): TVariables {
    return this._variablesSubject.value
  }

  private _setVariablesImmediate(
    variables: TVariables,
  ): Promise<void | ApolloQueryResult<TData>> {
    const _vars = this._withVariableOverrides(variables)
    return this._queryRef.setVariables(_vars || ({} as TVariables))
  }

  private _patchVariablesImmediate(
    variables: Partial<TVariables>,
  ): Promise<void | ApolloQueryResult<TData>> {
    const _variables = {
      ...this.getVariables(),
      ...variables,
    }

    const _vars = this._withVariableOverrides(_variables)
    return this._queryRef.setVariables(_vars || ({} as TVariables))
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
      ...variables,
    }

    this._variablesSubject.next(_variables)
    if (!this._observingChanges) {
      this._setVariablesImmediate(_variables)
    }
  }

  public refetch(
    variables?: TVariables,
    showLoading = false,
  ): Promise<ApolloQueryResult<TData>> {
    const _vars = this._withVariableOverrides(variables)
    if (showLoading) {
      this._manualPendingSubject.next(true)
    }
    // NOTE: There seems to be a bug causing Apollo to not emit changes unless
    // getCurrentResult() is called. This setTimeout is a workaround.
    setTimeout(() => this._queryRef.getCurrentResult())
    return this._queryRef.refetch(_vars)
  }

  public setQuery(
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    triggerRefetch: boolean = false,
  ): void {
    this._queryRef.setOptions({ query })
    if (triggerRefetch) {
      // Fake a variables update to share the debounce delay with setVariables.
      this.setVariables(this.getVariables())
    }
  }

  public getOptions(): WatchQueryOptions<TVariables, TData> | undefined {
    return (this._queryRef as any).obsQuery.options
  }

  public getQueryProcessingConfig(): QueryProcessingConfig | undefined {
    return this.getOptions()?.context?.queryProcessingConfig
  }

  /**
   * Returns the variables that were actually sent with the last request, read
   * directly from Apollo's observable query. This is more accurate than
   * `_variablesSubject.value` when variables can change between the debounce
   * firing and the response arriving.
   */
  private _getVariablesFromQueryRef(): TVariables {
    return (this._queryRef as any).obsQuery.variables
  }

  private _withVariableOverrides(
    variables?: TVariables,
  ): TVariables | undefined {
    if (
      !notNullOrUndefined(variables) &&
      !this.getQueryProcessingConfig()?.disablePaging
    ) {
      return undefined
    }

    const _vars = { ...(variables || {}) } as TVariables
    if (this.getQueryProcessingConfig()?.disablePaging) {
      _vars.take = this._totalCount
    }
    return _vars
  }

  private _emitError(error: readonly GraphQLFormattedError[]): void {
    this._errorSubject.next(error)
    if (this._defaultErrorHandler && !this._errorSubject.observed) {
      this._defaultErrorHandler(error)
    }
  }
}
