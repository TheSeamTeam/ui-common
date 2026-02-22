import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { SortItem } from '@theseam/ui-common/datatable'
import { DataFilterState } from '@theseam/ui-common/data-filters'
import { currentTickTime } from '@theseam/ui-common/testing'

import { GqlDatatableAccessor, EmptyObject } from '../models'
import {
  checkRecordsHaveValue,
  createSimpleGqlTestRoot,
  MockDatatable,
  SimpleGqlTestExtraVariables,
  SimpleGqlTestRecord,
  simpleGqlTestSchema,
  SimpleGqlTestVariables,
  SIMPLE_GQL_TEST_QUERY,
} from '../testing'
import { createApolloTestingProvider } from '../testing/create-apollo-testing-provider'
import { gqlVar } from '../utils/gql-var'
import {
  DatatableGraphQLDataMapper,
  DatatableGraphQLDataMapperResult,
  DatatableGraphQLQueryRef,
  DatatableGraphQLVariables,
} from './datatable-graphql-query-ref'
import { DatatableGraphqlService } from './datatable-graphql.service'
import {
  observeRowsWithGqlInputsHandling,
  SortsMapper,
  SortsMapperResult,
} from './datatable-helpers'
import { DEFAULT_PAGE_SIZE } from './get-page-info'
import { FilterStateMapperResult } from './map-filter-states'
import { MapperContext } from './mapper-context'

const _w = window as any
_w.__currentTickTime = currentTickTime

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NUM_RECORDS = 60

function createMapper(): DatatableGraphQLDataMapper<any, SimpleGqlTestRecord> {
  return (
    data: any,
  ): DatatableGraphQLDataMapperResult<SimpleGqlTestRecord> => ({
    rows: data.simpleGqlTestRecords.items as SimpleGqlTestRecord[],
    totalCount: data.simpleGqlTestRecords.totalCount as number,
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DatatableGraphQLQueryRef', () => {
  let datatableGql: DatatableGraphqlService
  const root = createSimpleGqlTestRoot(NUM_RECORDS)

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [createApolloTestingProvider(simpleGqlTestSchema, root)],
      teardown: { destroyAfterEach: false },
    })

    datatableGql = TestBed.inject(DatatableGraphqlService)
  })

  function createQueryRef() {
    return datatableGql.watchQuery<
      any,
      SimpleGqlTestVariables,
      SimpleGqlTestRecord
    >({
      query: SIMPLE_GQL_TEST_QUERY,
      variables: { skip: 0, take: DEFAULT_PAGE_SIZE },
    })
  }

  // -------------------------------------------------------------------------
  // rows(): initial emission
  // -------------------------------------------------------------------------

  it('rows() emits a buffer of totalCount size with the first page filled', fakeAsync(() => {
    const queryRef = createQueryRef()
    let emittedRows: SimpleGqlTestRecord[] | null = null
    let emitCount = 0

    const sub = queryRef.rows(createMapper()).subscribe((rows) => {
      emittedRows = rows
      emitCount++
    })

    tick(1)

    expect(emitCount).toBeGreaterThan(0)
    expect(emittedRows!.length).toBe(NUM_RECORDS)
    // First page (indices 0 – DEFAULT_PAGE_SIZE - 1) should be filled;
    // the remainder should be undefined (sparse array).
    expect(() =>
      checkRecordsHaveValue(emittedRows, [[0, DEFAULT_PAGE_SIZE - 1]]),
    ).not.toThrow()

    sub.unsubscribe()
  }))

  // -------------------------------------------------------------------------
  // rows(): paged buffer filling
  // -------------------------------------------------------------------------

  it('patchVariables fills the next page of the buffer after the debounce', fakeAsync(() => {
    const queryRef = createQueryRef()
    let emittedRows: SimpleGqlTestRecord[] | null = null
    let emitCount = 0

    const sub = queryRef.rows(createMapper()).subscribe((rows) => {
      emittedRows = rows
      emitCount++
    })

    // Wait for initial query
    tick(1)
    expect(emitCount).toBeGreaterThan(0)
    expect(() =>
      checkRecordsHaveValue(emittedRows, [[0, DEFAULT_PAGE_SIZE - 1]]),
    ).not.toThrow()
    const emitCountAfterFirstPage = emitCount

    // Request the second page
    queryRef.patchVariables({
      skip: DEFAULT_PAGE_SIZE,
      take: DEFAULT_PAGE_SIZE,
    })

    // Before debounce fires: no new emission
    tick(queryRef.updatesPollDelay - 1)
    expect(emitCount).toBe(emitCountAfterFirstPage)

    // After debounce fires and the query resolves
    tick(1)
    expect(emitCount).toBeGreaterThan(emitCountAfterFirstPage)
    expect(emittedRows!.length).toBe(NUM_RECORDS)
    // Both pages should now be filled
    expect(() =>
      checkRecordsHaveValue(emittedRows, [
        [0, DEFAULT_PAGE_SIZE - 1],
        [DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2 - 1],
      ]),
    ).not.toThrow()

    sub.unsubscribe()
  }))

  // -------------------------------------------------------------------------
  // rows(): late subscribers get last value (BehaviorSubject buffer)
  // -------------------------------------------------------------------------

  it('rows() replays the last emitted value to a late subscriber', fakeAsync(() => {
    const queryRef = createQueryRef()

    // First subscriber — triggers the query
    const sub1 = queryRef.rows(createMapper()).subscribe()
    tick(1)

    // Late subscriber — should immediately get the buffered rows
    let lateRows: SimpleGqlTestRecord[] | null = null
    const sub2 = queryRef.rows(createMapper()).subscribe((rows) => {
      lateRows = rows
    })

    tick(0)

    // The late subscriber should have received rows without needing another tick
    expect(lateRows).not.toBeNull()
    expect(lateRows!.length).toBe(NUM_RECORDS)

    sub1.unsubscribe()
    sub2.unsubscribe()
  }))

  // -------------------------------------------------------------------------
  // loading$
  // -------------------------------------------------------------------------

  it('loading$ is true initially and false after data loads', fakeAsync(() => {
    const queryRef = createQueryRef()
    const loadingStates: boolean[] = []

    // Subscribe to loading$ FIRST — before rows() triggers the query.
    // The hasEmittedSubject guard holds loading=true until the first full
    // load cycle, so we should see true before any query runs.
    const loadingSub = queryRef.loading$.subscribe((loading) => {
      loadingStates.push(loading)
    })

    expect(loadingStates[loadingStates.length - 1]).toBe(true)

    // Trigger the query
    const rowsSub = queryRef.rows(createMapper()).subscribe()

    tick(1)

    // After data lands: loading should be false
    expect(loadingStates[loadingStates.length - 1]).toBe(false)

    rowsSub.unsubscribe()
    loadingSub.unsubscribe()
  }))

  // -------------------------------------------------------------------------
  // variables$ public observable
  // -------------------------------------------------------------------------

  it('variables$ emits the current variables', fakeAsync(() => {
    const queryRef = createQueryRef()
    const emitted: SimpleGqlTestVariables[] = []
    const sub = queryRef.variables$.subscribe((v) => emitted.push(v))

    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted[emitted.length - 1]).toEqual(
      expect.objectContaining({ skip: 0, take: DEFAULT_PAGE_SIZE }),
    )

    sub.unsubscribe()
  }))
})

//
//
//
class BasicDatatablePageFixture<TData, TRow = EmptyObject> {
  private readonly _datatableSubject = new BehaviorSubject<
    GqlDatatableAccessor | undefined
  >(undefined)
  private readonly _rows$: Observable<TRow[]>
  private readonly _gqlDtAccessor: MockDatatable = new MockDatatable()
  private readonly _queryRef: DatatableGraphQLQueryRef<
    TData,
    SimpleGqlTestVariables,
    TRow
  >

  private _rowsSub: Subscription = Subscription.EMPTY
  private _emittedData: TRow[] | null = []
  private _emittedDataCount = 0
  private _datatableEmitted = false

  constructor(datatableGql: DatatableGraphqlService) {
    this._queryRef = datatableGql.watchQuery<
      TData,
      SimpleGqlTestVariables,
      TRow
    >(
      {
        query: SIMPLE_GQL_TEST_QUERY,
        variables: {
          skip: 0,
          take: DEFAULT_PAGE_SIZE,
        },
      },
      {
        variables: {
          // removeIfNotDefined: [ 'order', 'search' ],
          // removeIfNotUsed: [ 'search' ],
          inline: ['where'],
        },
        // Disabling paging until a solution for select all, when partially loaded datatset, is decided.
        // disablePaging: true
      },
    )

    const extraVariables$ = of({})

    const _rows$ = this._queryRef
      .rows((data: any) => {
        return {
          rows: data.simpleGqlTestRecords.items,
          totalCount: data.simpleGqlTestRecords.totalCount,
        }
      })
      .pipe(shareReplay({ bufferSize: 1, refCount: true }))

    const _mapSorts = (
      sorts: SortItem[],
      context: MapperContext,
    ): SortsMapperResult => {
      return sorts.map((s) => {
        const _dir = s?.dir.toUpperCase()

        switch (s?.prop) {
          case 'id':
            return { id: _dir }
          case 'name':
            return { name: _dir }
        }

        return { name: _dir }
      })
    }

    const _mapSearchFilterState = async (
      filterState: DataFilterState,
      context: MapperContext<SimpleGqlTestExtraVariables>,
    ): Promise<FilterStateMapperResult> => {
      const value = filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      const searchVar = gqlVar('search')
      const conditions: any[] = [
        { id: { objectContains: searchVar } },
        { name: { contains: searchVar } },
      ]

      return {
        filter: {
          or: conditions,
        },
        variables: { search: value },
      }
    }

    const _mapToggleButtonsState = (
      filterState: DataFilterState,
      context: MapperContext<SimpleGqlTestExtraVariables>,
    ): FilterStateMapperResult => {
      const value = Array.isArray(filterState.state?.value)
        ? filterState.state?.value[0]?.trim()
        : filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      return {
        filter: { status: { eq: value } },
        variables: {},
      }
    }

    this._rows$ = observeRowsWithGqlInputsHandling(
      this._queryRef,
      _rows$,
      this._datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        search: _mapSearchFilterState,
        'toggle-buttons': _mapToggleButtonsState,
      },
    )
  }

  public init(emitDatatable: boolean = true): void {
    // console.log('time', currentTickTime())
    this._emittedData = null
    this._emittedDataCount = 0

    this._rowsSub = this._rows$.subscribe((data) => {
      // console.log('time', currentTickTime())
      this._gqlDtAccessor?.setRows(data)
      this._emittedData = data
      this._emittedDataCount++
    })

    if (emitDatatable) {
      this.simulateDatatableReady()
    }
  }

  public destroy(): void {
    this._rowsSub.unsubscribe()
  }

  /**
   * Our apps datatable pages query the datatable with
   * `@ViewChild(DatatableComponent, { static: true })` and emit the datatable
   * to `observeRowsWithGqlInputsHandling` when the `ViewChild` setter is
   * called. This should simulate that process by emitting the `MockDatatable`
   * to the waiting `observeRowsWithGqlInputsHandling`.
   */
  public simulateDatatableReady(): void {
    if (this._datatableEmitted) {
      // TODO: This is a low priority, because none of our current pages should
      // emit the datatable more than once, but I see this as a valid scenario
      // that should be considered.
      //
      // Some questions to consider when implementing:
      // - Do we emit the same datatable instance or a new datatable instance.
      //  + I think it should be optional, because both may be valid, but I am
      //    not sure which would be more likely.
      // - Should `observeRowsWithGqlInputsHandling` fully reinitialize or only
      //   specific observations of the datatable.
      //  + My main concern is the page state not being in sync with the emitted
      //    data.

      throw Error(
        `BasicDatatablePageFixture does not support emitting the datatable more than once, yet.`,
      )
    }

    this._datatableSubject.next(this._gqlDtAccessor)
    this._datatableEmitted = true
  }

  /**
   * Access the datatable.
   */
  public get datatable(): MockDatatable {
    return this._gqlDtAccessor
  }

  /**
   * Returns the most recently emitted data.
   */
  public get emittedData(): TRow[] | null {
    return this._emittedData
  }

  /**
   * Returns how many times the data has been emitted.
   */
  public get emittedDataCount(): number {
    return this._emittedDataCount
  }

  public get updatesPollDelay(): number {
    return this._queryRef.updatesPollDelay
  }
}
