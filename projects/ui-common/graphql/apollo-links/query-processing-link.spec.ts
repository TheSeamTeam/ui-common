import { ApolloLink, FetchResult, Observable } from '@apollo/client/core'
import { gql } from 'apollo-angular'
import { DocumentNode, print } from 'graphql'

import { queryProcessingLink } from './query-processing-link'

// Terminates the link chain and returns the final operation state so tests can
// inspect both the transformed query and the transformed variables.
const testResultLink = new ApolloLink((operation) => {
  return Observable.of({ data: { operation } })
})

interface TestBefore {
  query: DocumentNode
  variables: Record<string, any>
  /** Optional Apollo context, e.g. `{ queryProcessingConfig: { ... } }` */
  context?: Record<string, any>
}

interface TestExpected {
  query: DocumentNode
  variables: Record<string, any>
}

function testOperation(before: TestBefore, expected: TestExpected): void {
  const link = queryProcessingLink.concat(testResultLink)

  ApolloLink.execute(link, {
    query: before.query,
    variables: before.variables,
    context: before.context,
  }).subscribe((v: FetchResult) => {
    expect(print(v.data?.operation.query)).toBe(print(expected.query))
    expect(v.data?.operation.variables).toEqual(expected.variables)
  })
}

// ---------------------------------------------------------------------------
// Hint: remove-not-defined
// ---------------------------------------------------------------------------
describe('queryProcessingLink', () => {
  describe('Hint "remove-not-defined"', () => {
    it('removes variable definition and argument when value is undefined', () => {
      testOperation(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: undefined },
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
              }
            }
          `,
          variables: { where: undefined },
        },
      )
    })

    it('removes variable definition and argument when value is null', () => {
      testOperation(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: null },
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
              }
            }
          `,
          variables: { where: null },
        },
      )
    })

    it('keeps variable when it has a value', () => {
      testOperation(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: 'someValue' },
        },
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: 'someValue' },
        },
      )
    })

    it('removes multiple undefined variables independently', () => {
      testOperation(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($where: String, $order: String, $search: String) {
              example(where: $where, order: $order, search: $search) {
                totalCount
              }
            }
          `,
          variables: { where: undefined, order: undefined, search: 'hello' },
        },
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($search: String) {
              example(search: $search) {
                totalCount
              }
            }
          `,
          variables: { where: undefined, order: undefined, search: 'hello' },
        },
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Hint: inline-variable
  // ---------------------------------------------------------------------------
  describe('Hint "inline-variable"', () => {
    it('inlines a string variable and removes it from variables map', () => {
      testOperation(
        {
          query: gql`
            query TestQuery(
              # @gql-hint: inline-variable
              $search: String
            ) {
              example(search: $search) {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
        },
        {
          query: gql`
            query TestQuery {
              example(search: "hello") {
                totalCount
              }
            }
          `,
          variables: {},
        },
      )
    })

    it('inlines an object variable', () => {
      testOperation(
        {
          query: gql`
            query TestQuery(
              # @gql-hint: inline-variable
              $where: String
            ) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: { id: { eq: 5 } } },
        },
        {
          query: gql`
            query TestQuery {
              example(where: { id: { eq: 5 } }) {
                totalCount
              }
            }
          `,
          variables: {},
        },
      )
    })

    it('leaves other variables intact when inlining one', () => {
      testOperation(
        {
          query: gql`
            query TestQuery(
              $skip: Int
              $take: Int
              # @gql-hint: inline-variable
              $where: String
            ) {
              example(skip: $skip, take: $take, where: $where) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, take: 10, where: { id: { eq: 5 } } },
        },
        {
          query: gql`
            query TestQuery($skip: Int, $take: Int) {
              example(skip: $skip, take: $take, where: { id: { eq: 5 } }) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, take: 10 },
        },
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Config: removeIfNotDefined
  // ---------------------------------------------------------------------------
  describe('Config "removeIfNotDefined"', () => {
    it('removes variable when it is undefined', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: undefined },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotDefined: ['where'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
              }
            }
          `,
          variables: { where: undefined },
        },
      )
    })

    it('removes variable when it is null', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($order: String) {
              example(order: $order) {
                totalCount
              }
            }
          `,
          variables: { order: null },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotDefined: ['order'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
              }
            }
          `,
          variables: { order: null },
        },
      )
    })

    it('keeps variable when it has a value', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: 'someValue' },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotDefined: ['where'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: 'someValue' },
        },
      )
    })

    it('only removes the named variables, not others', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($skip: Int, $where: String) {
              example(skip: $skip, where: $where) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, where: undefined },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotDefined: ['where'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery($skip: Int) {
              example(skip: $skip) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, where: undefined },
        },
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Config: removeIfNotUsed
  // ---------------------------------------------------------------------------
  describe('Config "removeIfNotUsed"', () => {
    it('removes variable definition when variable is not referenced in the query', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($search: String) {
              example {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotUsed: ['search'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery {
              example {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
        },
      )
    })

    it('keeps variable when it is referenced in the query', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($search: String) {
              example(search: $search) {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
          context: {
            queryProcessingConfig: {
              variables: { removeIfNotUsed: ['search'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery($search: String) {
              example(search: $search) {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
        },
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Config: inline
  // ---------------------------------------------------------------------------
  describe('Config "inline"', () => {
    it('inlines a string variable value', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($search: String) {
              example(search: $search) {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
          context: {
            queryProcessingConfig: {
              variables: { inline: ['search'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery {
              example(search: "hello") {
                totalCount
              }
            }
          `,
          variables: {},
        },
      )
    })

    it('inlines an object variable value', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: { name: { contains: 'foo' } } },
          context: {
            queryProcessingConfig: {
              variables: { inline: ['where'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery {
              example(where: { name: { contains: "foo" } }) {
                totalCount
              }
            }
          `,
          variables: {},
        },
      )
    })

    it('leaves other variables intact when inlining one', () => {
      testOperation(
        {
          query: gql`
            query TestQuery($skip: Int, $take: Int, $where: String) {
              example(skip: $skip, take: $take, where: $where) {
                totalCount
              }
            }
          `,
          variables: {
            skip: 0,
            take: 10,
            where: { name: { contains: 'foo' } },
          },
          context: {
            queryProcessingConfig: {
              variables: { inline: ['where'] },
            },
          },
        },
        {
          query: gql`
            query TestQuery($skip: Int, $take: Int) {
              example(
                skip: $skip
                take: $take
                where: { name: { contains: "foo" } }
              ) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, take: 10 },
        },
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Combined: removeIfNotDefined then removeIfNotUsed
  // ---------------------------------------------------------------------------
  describe('Combined config: removeIfNotDefined + removeIfNotUsed', () => {
    it('cleans up an orphaned variable after its dependent is removed', () => {
      // $search is defined but not used as an argument — it would only matter
      // if $where referenced it. Since $where is undefined and removed first,
      // $search has no usages and is cleaned up by removeIfNotUsed.
      testOperation(
        {
          query: gql`
            query TestQuery($skip: Int, $where: String, $search: String) {
              example(skip: $skip, where: $where) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, where: undefined, search: 'hello' },
          context: {
            queryProcessingConfig: {
              variables: {
                removeIfNotDefined: ['where'],
                removeIfNotUsed: ['search'],
              },
            },
          },
        },
        {
          query: gql`
            query TestQuery($skip: Int) {
              example(skip: $skip) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, where: undefined, search: 'hello' },
        },
      )
    })
  })
})
