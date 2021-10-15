import { EventEmitter } from '@angular/core'
import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BehaviorSubject, Observable, of, Subject } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import { ApolloLink, concat, InMemoryCache } from '@apollo/client/core'
import { DataFilterState } from '@theseam/ui-common/data-filters'
import { DatatableComponent, SortEvent, SortItem, TheSeamPageInfo } from '@theseam/ui-common/datatable'
import { hasProperty } from '@theseam/ui-common/utils'
import { APOLLO_OPTIONS, gql } from 'apollo-angular'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'

import { GqlDatatableAccessor } from '../models'
import { gqlVar } from '../utils/gql-var'
import { DatatableGraphqlService } from './datatable-graphql.service'
import {
  DEFAULT_PAGE_SIZE,
  observeRowsWithGqlInputsHandling, SortsMapperResult
} from './datatable-helpers'
import { FilterStateMapperResult } from './map-filter-states'
import { MapperContext } from './mapper-context'

import { buildSchema, graphql, print } from 'graphql'
import { queryProcessingLink } from '../apollo-links'
import { graphQLLink } from '../apollo-links/graphql-link'
import { baseSchemaFragment, filteredResults, GqlDatatableFixture } from '../testing'

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
    $where: ClaimFilterInput
  ) {
    claims(where: $where) {
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
  // let controller: ApolloTestingController
  let datatableGql: DatatableGraphqlService

  beforeEach(() => {
    TestBed.configureTestingModule({
      // imports: [ApolloTestingModule],
      providers: [
        {
          provide: APOLLO_OPTIONS,
          useFactory: () => {
            return {
              cache: new InMemoryCache(),
              link: concat(queryProcessingLink, graphQLLink({
                schema,
                rootValue: root,
              })),
            }
          },
          // deps: [],
        }
      ]
    })

    // controller = TestBed.inject(ApolloTestingController)
    datatableGql = TestBed.inject(DatatableGraphqlService)
  })

  // afterEach(() => {
  //   controller.verify()
  // })

  it('should', fakeAsync(() => {
    const queryRef = datatableGql.watchQuery<GqlData, GqlVariables, RowData>(
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

    const datatableSubject = new BehaviorSubject<GqlDatatableAccessor | undefined>(undefined)

    const extraVariables$ = of({})

    const _rows$ = queryRef.rows((data: any) => {
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

    const rows$ = observeRowsWithGqlInputsHandling(
      queryRef,
      _rows$,
      datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        'search': _mapSearchFilterState,
        'toggle-buttons': _mapToggleButtonsState
      }
    )

    const gqlDtAccessor = new GqlDatatableFixture()

    let emittedDataCount: number = 0
    let emittedData: any = null
    // Call the relevant method
    const rowsSub = rows$.subscribe((data) => {
      // Make some assertion about the result;
      gqlDtAccessor?.setRows(data)

      // if (emittedDataCount === 0) {
      //   expect(data.length).toEqual(0)
      // } else if (emittedDataCount === 1) {
      //   expect(data.length).toEqual(30)
      //   expect(data[0].name).toEqual('Name0')
      // } else {
      //   // throw Error(`Should not emit 3 times.`)
      // }

      emittedData = data
      emittedDataCount++
    })

    datatableSubject.next(gqlDtAccessor)

    expect(emittedDataCount).toEqual(0)

    tick(1)

    // NOTE: This jumps to 2 instead of 1, because it initially emits an empty array.
    expect(emittedDataCount).toEqual(2)
    expect(emittedData?.length).toEqual(30)

    // gqlDtAccessor.setPage({ pageSize: DEFAULT_PAGE_SIZE, offset: 4, count: 6 })
    // gqlDtAccessor.setOffset(4)
    gqlDtAccessor.setPage(1)

    tick(queryRef.updatesPollDelay + 1000)

    // expect(emittedDataCount).toEqual(3)
    // expect(emittedData?.length).toEqual(30)

    rowsSub.unsubscribe()
  }))
})


