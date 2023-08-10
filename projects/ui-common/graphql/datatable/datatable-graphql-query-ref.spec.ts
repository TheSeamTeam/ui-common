import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { SortItem } from '@theseam/ui-common/datatable'
import { DataFilterState } from '@theseam/ui-common/data-filters'
import { currentTickTime } from '@theseam/ui-common/testing'

import { EmptyObject } from 'apollo-angular/types'
import { GqlDatatableAccessor } from '../models'
import {
  checkRecordsHaveValue,
  createSimpleGqlTestRoot,
  MockDatatable,
  SimpleGqlTestExtraVariables,
  SimpleGqlTestRecord,
  simpleGqlTestSchema,
  SimpleGqlTestVariables,
  SIMPLE_GQL_TEST_QUERY
} from '../testing'
import { createApolloTestingProvider } from '../testing/create-apollo-testing-provider'
import { gqlVar } from '../utils/gql-var'
import { DatatableGraphQLQueryRef, DatatableGraphQLVariables } from './datatable-graphql-query-ref'
import { DatatableGraphqlService } from './datatable-graphql.service'
import {
  observeRowsWithGqlInputsHandling, SortsMapper, SortsMapperResult
} from './datatable-helpers'
import { DEFAULT_PAGE_SIZE } from './get-page-info'
import { FilterStateMapperResult } from './map-filter-states'
import { MapperContext } from './mapper-context'

const _w = window as any
_w.__currentTickTime = currentTickTime

describe('DatatableGraphQLQueryRef', () => {
  let datatableGql: DatatableGraphqlService
  let pageFixture: BasicDatatablePageFixture<SimpleGqlTestRecord>

  const numRecords = 60
  const root = createSimpleGqlTestRoot(numRecords)

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [createApolloTestingProvider(simpleGqlTestSchema, root)],
      teardown: { destroyAfterEach: false }
    })

    datatableGql = TestBed.inject(DatatableGraphqlService)
    pageFixture = new BasicDatatablePageFixture(datatableGql)
  })

  it('should query when new page is set', fakeAsync(async () => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)
    expect(() => checkRecordsHaveValue(pageFixture.emittedData, [])).not.toThrow()

    tick(1)
    currentTickTime()

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)
    expect(() => checkRecordsHaveValue(pageFixture.emittedData, [ [ 0, (pageFixture.datatable.getPageSize() * 2) - 1 ] ])).not.toThrow()

    pageFixture.datatable.setPage(1)

    tick(pageFixture.updatesPollDelay - 2)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    tick(1)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)
    expect(() => checkRecordsHaveValue(pageFixture.emittedData, [ [ 0, (pageFixture.datatable.getPageSize() * 3) - 1 ] ])).not.toThrow()

    pageFixture.destroy()
  }))

  it('should query when page changes from scroll', fakeAsync(() => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)

    tick(1)

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    pageFixture.datatable.setScrolledPosV(pageFixture.datatable.getRowHeight() + 1)

    tick(pageFixture.updatesPollDelay - 2)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    tick(2)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    pageFixture.destroy()
  }))

  it('should not query when page doesn\'t change from scroll', fakeAsync(() => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)

    tick(1)

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    pageFixture.datatable.setScrolledPosV(pageFixture.datatable.getRowHeight() + 1)

    tick(pageFixture.updatesPollDelay - 2)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    tick(2)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    pageFixture.datatable.setScrolledPosV(pageFixture.datatable.getRowHeight() + 2)

    tick(pageFixture.updatesPollDelay)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(numRecords)

    pageFixture.destroy()
  }))
})

//
//
//
class BasicDatatablePageFixture<TData, TRow = EmptyObject> {

  private readonly _datatableSubject = new BehaviorSubject<GqlDatatableAccessor | undefined>(undefined)
  private readonly _rows$: Observable<TRow[]>
  private readonly _gqlDtAccessor: MockDatatable = new MockDatatable()
  private readonly _queryRef: DatatableGraphQLQueryRef<TData, SimpleGqlTestVariables, TRow>

  private _rowsSub: Subscription = Subscription.EMPTY
  private _emittedData: TRow[] | null = []
  private _emittedDataCount = 0
  private _datatableEmitted = false

  constructor(datatableGql: DatatableGraphqlService) {
    this._queryRef = datatableGql.watchQuery<TData, SimpleGqlTestVariables, TRow>(
      {
        query: SIMPLE_GQL_TEST_QUERY,
        variables: {
          skip: 0,
          take: DEFAULT_PAGE_SIZE
        }
      },
      {
        variables: {
          // removeIfNotDefined: [ 'order', 'search' ],
          // removeIfNotUsed: [ 'search' ],
          inline: [ 'where' ]
        },
        // Disabling paging until a solution for select all, when partially loaded datatset, is decided.
        // disablePaging: true
      }
    )

    const extraVariables$ = of({})

    const _rows$ = this._queryRef.rows((data: any) => {
      return {
        rows: data.simpleGqlTestRecords.items,
        totalCount: data.simpleGqlTestRecords.totalCount
      }
    }).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    )

    const _mapSorts = (sorts: SortItem[], context: MapperContext): SortsMapperResult => {
      return sorts.map(s => {
        const _dir = s?.dir.toUpperCase()

        switch (s?.prop) {
          case 'id': return ({ id: _dir })
          case 'name': return ({ name: _dir })
        }

        return ({ name: _dir })
      })
    }

    const _mapSearchFilterState = async (
      filterState: DataFilterState, context: MapperContext<SimpleGqlTestExtraVariables>
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
          or: conditions
        },
        variables: { search: value }
      }
    }

    const _mapToggleButtonsState = (
      filterState: DataFilterState,
      context: MapperContext<SimpleGqlTestExtraVariables>
    ): FilterStateMapperResult => {
      const value = Array.isArray(filterState.state?.value) ? filterState.state?.value[0]?.trim() : filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      return {
        filter: { status: { eq: value } },
        variables: { }
      }
    }

    this._rows$ = observeRowsWithGqlInputsHandling(
      this._queryRef,
      _rows$,
      this._datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        'search': _mapSearchFilterState,
        'toggle-buttons': _mapToggleButtonsState
      }
    )
  }

  public init(emitDatatable: boolean = true): void {
    // console.log('time', currentTickTime())
    this._emittedData = null
    this._emittedDataCount = 0

    this._rowsSub = this._rows$.subscribe(data => {
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

      throw Error(`BasicDatatablePageFixture does not support emitting the datatable more than once, yet.`)
    }

    this._datatableSubject.next(this._gqlDtAccessor)
    this._datatableEmitted = true
  }

  /**
   * Access the datatable.
   */
  public get datatable(): MockDatatable { return this._gqlDtAccessor }

  /**
   * Returns the most recently emitted data.
   */
  public get emittedData(): TRow[] | null { return this._emittedData }

  /**
   * Returns how many times the data has been emitted.
   */
  public get emittedDataCount(): number { return this._emittedDataCount }

  public get updatesPollDelay(): number { return this._queryRef.updatesPollDelay }
}
