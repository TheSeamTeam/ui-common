import { EventEmitter } from '@angular/core'
import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import { ApolloLink, concat, InMemoryCache } from '@apollo/client/core'
import { DataFilterState } from '@theseam/ui-common/data-filters'
import { DatatableComponent, SortEvent, SortItem, TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { hasProperty } from '@theseam/ui-common/utils'
import { APOLLO_OPTIONS, gql } from 'apollo-angular'

import { GqlDatatableAccessor } from '../models'
import { gqlVar } from '../utils/gql-var'
import { DatatableGraphqlService } from './datatable-graphql.service'
import {
  DEFAULT_PAGE_SIZE,
  observeRowsWithGqlInputsHandling, SortsMapperResult
} from './datatable-helpers'
import { FilterStateMapperResult } from './map-filter-states'
import { MapperContext } from './mapper-context'

import { buildSchema, print } from 'graphql'
import { queryProcessingLink } from '../apollo-links'
import { graphQLLink } from '../apollo-links/graphql-link'
import { baseSchemaFragment, filteredResults, MockDatatable } from '../testing'
import { DatatableGraphQLQueryRef } from './datatable-graphql-query-ref'

const currentTickTime = () => (window as any).Zone.current._properties.FakeAsyncTestZoneSpec._scheduler._currentTickTime
const _w = window as any
_w.__currentTickTime = currentTickTime

function _createClaim(num: number): { claimId: number, name: string } {
  return { claimId: num, name: `Name${num}` }
}

const schema = buildSchema(print(gql`
  ${baseSchemaFragment}

  type ClaimCollectionSegment {
    items: [Claim!]

    """Information to aid in pagination."""
    pageInfo: CollectionSegmentInfo!
    totalCount: Int!
  }

  input ClaimFilterInput {
    and: [ClaimFilterInput!]
    or: [ClaimFilterInput!]
    claimId: ComparableInt32OperationFilterInput
    name: StringOperationFilterInput
    objectContains: String
  }

  type Claim {
    claimId: Int
    name: String
  }

  type Query {
    claims(
      skip: Int
      take: Int
      where: ClaimFilterInput
    ): ClaimCollectionSegment
  }
`))

const _claims: { claimId: number, name: string }[] = []
for (let i = 0; i < 30; i++) { _claims.push(_createClaim(i)) }

const root = {
  claims: (args?: any) => filteredResults([ ..._claims ], args)
}


const QUERY = gql`
  query ExampleQuery(
    $skip: Int
    $take: Int
    $where: ClaimFilterInput
  ) {
    claims(
      skip: $skip
      take: $take
      where: $where
    ) {
      items {
        claimId
        name
      }
      totalCount
    }
  }
`

interface GqlData {
  claimId: number
  name: string
}

interface GqlExtraVariables {

}

interface GqlVariables extends GqlExtraVariables {
  skip?: number
  take?: number
  order?: any
  where?: any
  // search?: string
}

type RowData = GqlData

describe('DatatableGraphQLQueryRef', () => {
  let datatableGql: DatatableGraphqlService
  let pageFixture: BasicDatatablePageFixture

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // ApolloTestingModule is very limited. We need to emit more than once,
        // so I made an ApolloLink to use in place of HttpLink.
        {
          provide: APOLLO_OPTIONS,
          useFactory: () => {
            return {
              cache: new InMemoryCache(),
              link: concat(queryProcessingLink, graphQLLink({
                schema,
                rootValue: root,
              })),
              defaultOptions: {
                watchQuery: {
                  fetchPolicy: 'cache-and-network',
                  errorPolicy: 'ignore',
                },
                query: {
                  fetchPolicy: 'network-only',
                  errorPolicy: 'all',
                },
              }
            }
          }
        }
      ]
    })

    datatableGql = TestBed.inject(DatatableGraphqlService)
    pageFixture = new BasicDatatablePageFixture(datatableGql)
  })


  it('should query new page is set', fakeAsync(() => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)

    tick(1)

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.datatable.setPage(1)

    // tick(queryRef.updatesPollDelay + 1000)
    tick(499)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    tick(1)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.destroy()
  }))

  it('should query when page changes from scroll', fakeAsync(() => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)

    tick(1)

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.datatable.setScrolledPosV(60)

    // tick(queryRef.updatesPollDelay + 1000)
    tick(499)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    tick(2)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.destroy()
  }))

  it('should not query when page doesn\'t change from scroll', fakeAsync(() => {
    pageFixture.init()

    expect(pageFixture.emittedDataCount).toEqual(0)

    tick(1)

    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.datatable.setScrolledPosV(60)

    // tick(queryRef.updatesPollDelay + 1000)
    tick(499)
    expect(pageFixture.emittedDataCount).toEqual(1)
    expect(pageFixture.emittedData?.length).toEqual(30)

    tick(2)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.datatable.setScrolledPosV(65)

    tick(500)
    expect(pageFixture.emittedDataCount).toEqual(2)
    expect(pageFixture.emittedData?.length).toEqual(30)

    pageFixture.destroy()
  }))



})


//
//
//
class BasicDatatablePageFixture {

  private readonly _datatableSubject = new BehaviorSubject<GqlDatatableAccessor | undefined>(undefined)
  private readonly _rows$: Observable<GqlData[]>
  private readonly _gqlDtAccessor: MockDatatable = new MockDatatable()
  private readonly _queryRef: DatatableGraphQLQueryRef<GqlData, GqlVariables, GqlData>

  private _rowsSub: Subscription = Subscription.EMPTY
  private _emittedData: GqlData[] | null = []
  private _emittedDataCount: number = 0
  private _datatableEmitted: boolean = false

  constructor(datatableGql: DatatableGraphqlService) {
    this._queryRef = datatableGql.watchQuery<GqlData, GqlVariables, RowData>(
      {
        query: QUERY,
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
        rows: data.claims.items,
        totalCount: data.claims.totalCount
      }
    }).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    )

    const _mapSorts = (sorts: { dir: 'desc' | 'asc', prop: string }[], context: MapperContext): SortsMapperResult => {
      return sorts.map(s => {
        const _dir = s?.dir.toUpperCase()

        switch (s?.prop) {
          case 'claimId': return ({ claimId: _dir })
          case 'name': return ({ name: _dir })
        }

        return ({ name: _dir })
      })
    }

    const _mapSearchFilterState = async (
      filterState: DataFilterState, context: MapperContext<GqlExtraVariables>
    ): Promise<FilterStateMapperResult> => {
      const value = filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      const searchVar = gqlVar('search')
      const conditions: any[] = [
        { claimId: { objectContains: searchVar } },
        { memberId: { objectContains: searchVar } },
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
      context: MapperContext<GqlExtraVariables>
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
    this._emittedData = null
    this._emittedDataCount = 0

    this._rowsSub = this._rows$.subscribe((data) => {
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
  public get emittedData(): GqlData[] | null { return this._emittedData }

  /**
   * Returns how many times the data has been emitted.
   */
  public get emittedDataCount(): number { return this._emittedDataCount }
}
