import { ApolloLink, execute, gql } from '@apollo/client/core'

import { queryProcessingLink } from '../apollo-links/query-processing-link'
import { gqlVar } from '../utils/gql-var'
import { createSimpleGqlTestRoot } from './data/simple-gql-test-data'
import { mockGraphQLLink } from './mock-graphql-link'

function runOperation(
  link: ApolloLink,
  query: any,
  variables: any,
  context?: any,
): Promise<any> {
  return new Promise((resolve, reject) => {
    let last: any
    execute(link, { query, variables, context: context ?? {} }).subscribe({
      next: (v) => (last = v),
      error: reject,
      complete: () => resolve(last),
    })
  })
}

describe('mockGraphQLLink + queryProcessingLink', () => {
  // Exercises the realistic datatable shape where `where` and `fixedFilters`
  // are inlined and a search filter injects `gqlVar('search')` into the where.
  // After inlining, the where AST contains literal `$search` references that
  // `resolveEffectiveVariables` must resolve from the variables map so that
  // `filter-where` receives concrete operand values.
  it('resolves $search references inside an inlined where clause', async () => {
    const QUERY = gql`
      query ExampleQuery(
        $skip: Int
        $take: Int
        $order: [SimpleGqlTestRecordSortInput!]
        $where: SimpleGqlTestRecordFilterInput
        $fixedFilters: String!
        $search: String!
      ) {
        simpleGqlTestRecords(
          skip: $skip
          take: $take
          order: $order
          where: { and: [$fixedFilters, $where] }
        ) {
          items {
            id
            name
          }
          totalCount
        }
      }
    `

    let resolvedVariables: any = null
    const link = ApolloLink.from([
      queryProcessingLink,
      mockGraphQLLink({
        resolve: (operation) => {
          resolvedVariables = operation.variables
          const root = createSimpleGqlTestRoot(600)
          return {
            data: {
              simpleGqlTestRecords: root.simpleGqlTestRecords(
                operation.variables,
              ),
            },
          }
        },
      }),
    ])

    const searchVar = gqlVar('search')
    const where = {
      and: [
        {
          or: [
            { id: { objectContains: searchVar } },
            { name: { contains: searchVar } },
          ],
        },
      ],
    }

    const result = await runOperation(
      link,
      QUERY,
      { skip: 0, take: 22, search: 'Item_5', where },
      {
        queryProcessingConfig: {
          variables: {
            removeIfNotDefined: ['order', 'search', 'fixedFilters'],
            removeIfNotUsed: ['search', 'fixedFilters', 'where'],
            inline: ['where', 'fixedFilters'],
          },
        },
      },
    )

    // The mock should have received fully-resolved variables (no $search refs).
    expect(resolvedVariables.search).toBe('Item_5')
    expect(JSON.stringify(resolvedVariables.where)).not.toContain('gqlVar')
    expect(JSON.stringify(resolvedVariables.where)).not.toContain('$search')

    // Items containing "Item_5": 5, 50-59, 500-599 → 111 total
    expect(result.data.simpleGqlTestRecords.totalCount).toBe(111)
    expect(result.data.simpleGqlTestRecords.items.length).toBe(22)
    expect(result.data.simpleGqlTestRecords.items[0]).toEqual({
      id: 5,
      name: 'Item_5',
    })
  })
})
