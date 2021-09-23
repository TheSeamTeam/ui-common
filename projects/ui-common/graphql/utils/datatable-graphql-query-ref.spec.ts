import { EventEmitter } from '@angular/core'
import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { BehaviorSubject, Observable, of } from 'rxjs'
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
import { DatatableGraphqlService } from '../services'
import { DEFAULT_PAGE_SIZE, FilterStateMapperResult, MapperContext, observeRowsWithGqlInputsHandling, SortsMapperResult } from './datatable-helpers'
import { gqlVar } from './gql-var'

import { buildSchema, graphql, print } from 'graphql'
import { isSource } from 'graphql/language/source'
import { queryProcessingLink } from '../apollo-links'
import { graphQLLink } from '../apollo-links/graphql-link'
import { baseSchemaFragment, filterWhere, skipAndTake, WhereArg } from '../testing'

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
  claims: (args?: any) => {
    let result: any = [ ..._claims ]

    const where: WhereArg = args?.where
    if (where !== undefined) {
      result = filterWhere(result, where)
    }

    const totalCount = result.length

    const skip = args?.skip ?? 0
    const take = args?.take ?? result.length
    if (args?.skip !== undefined || args?.take !== undefined) {
      result = skipAndTake(result, skip, take)
    }

    const pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean } = {
      hasNextPage: (skip + take) < totalCount,
      hasPreviousPage: skip > 0,
    }

    return {
      items: result,
      pageInfo,
      totalCount,
    }
  }
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
              // link: concat(queryProcessingLink, httpLink.create({
              //   uri: environment.graphqlUrl,
              // })),
              // connectToDevtools: true

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

  it('should', fakeAsync(async () => {
    // const where: WhereArg = {
    //   claimId: { eq: 2 }
    // }
    // // const res = _parseWhereItems(where)

    // // const resp = await graphql(schema, '{ hello }', root)
    // // const resp2 = await graphql(schema, `{
    // //   claims(where: { claimId: { eq: 2 } }) {
    // //     name
    // //   }
    // // }`, root, {}, { where })
    // const resp2 = await graphql(schema, print(QUERY_2), root, {}, { where })


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
        // rows: data.claims.items.map(this._mapRow),
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

    let emittedDataCount = 0
    // Call the relevant method
    const rowsSub = rows$.subscribe((data) => {
      // Make some assertion about the result;

      if (emittedDataCount === 0) {
        expect(data.length).toEqual(0)
      } else if (emittedDataCount === 1) {
        expect(data.length).toEqual(6)
        expect(data[0].name).toEqual('Name2')
      } else {
        // throw Error(`Should not emit 3 times.`)
      }

      emittedDataCount++
    })


    const gqlDtAccessor = new GqlDatatableAccessorFixture()
    datatableSubject.next(gqlDtAccessor)

    tick(1)

    // The following `expectOne()` will match the operation's document.
    // If no requests or multiple requests matched that document
    // `expectOne()` would throw.
    // const op = controller.expectOne(QUERY)

    // Assert that one of variables is Mr Apollo.
    // expect(op.operation.variables.name).toEqual('Mr Apollo');

    // Respond with mock data, causing Observable to resolve.
    // op.flush({
    //   data: {
    //     example: {
    //       items: [
    //         {
    //           claimId: 1,
    //           memberId: 101,
    //           name: 'Name1',
    //         },
    //         {
    //           claimId: 2,
    //           memberId: 102,
    //           name: 'Name2',
    //         },
    //         {
    //           claimId: 3,
    //           memberId: 103,
    //           name: 'Name3',
    //         },
    //         {
    //           claimId: 4,
    //           memberId: 104,
    //           name: 'Name4',
    //         },
    //         {
    //           claimId: 5,
    //           memberId: 105,
    //           name: 'Name5',
    //         },
    //         {
    //           claimId: 6,
    //           memberId: 106,
    //           name: 'Name6',
    //         }
    //       ],
    //       totalCount: 6
    //     },
    //   },
    // })

    gqlDtAccessor.setPage({ pageSize: DEFAULT_PAGE_SIZE, offset: 4, count: 6 })

    tick(1)


    tick(1)

    // op.flush({
    //   data: {
    //     example: {
    //       items: [
    //         {
    //           claimId: 1,
    //           memberId: 101,
    //           name: 'Name1',
    //         },
    //         {
    //           claimId: 2,
    //           memberId: 102,
    //           name: 'Name2',
    //         },
    //         {
    //           claimId: 3,
    //           memberId: 103,
    //           name: 'Name3',
    //         },
    //         {
    //           claimId: 4,
    //           memberId: 104,
    //           name: 'Name4',
    //         },
    //         {
    //           claimId: 5,
    //           memberId: 105,
    //           name: 'Name5',
    //         },
    //         {
    //           claimId: 6,
    //           memberId: 106,
    //           name: 'Name6',
    //         }
    //       ],
    //       totalCount: 6
    //     },
    //   },
    // })

    tick(1)

    rowsSub.unsubscribe()
  }))
})

class GqlDatatableAccessorFixture implements GqlDatatableAccessor {
  private _sorts: SortItem[] = []
  private _filterStatesSubject = new BehaviorSubject<DataFilterState[]>([])

  page: EventEmitter<TheSeamPageInfo> = new EventEmitter()
  sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>()
  get sorts(): SortItem[] { return this._sorts }
  set sorts(value: SortItem[]) { this._sorts = value }
  public filterStates: Observable<DataFilterState[]> = this._filterStatesSubject.asObservable()
  ngxDatatable: { offset: number; pageSize: number; limit?: number; count: number } = {
    offset: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    count: 0
  }

  //

  setSorts(v: SortItem[]): void {
    this._sorts = v
    this.sort.emit({ sorts: this._sorts })
  }

  setFilterStates(v: DataFilterState[]): void {
    this._filterStatesSubject.next(v)
  }

  setPage(v: TheSeamPageInfo): void {
    this.ngxDatatable = v
    this.page.emit(v)
  }

}
