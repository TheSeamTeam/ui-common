import { gql } from 'apollo-angular'
import { DocumentNode, print } from 'graphql'

import { QueryProcessingConfig } from '../models'
import { processGql } from './process-gql'

interface TestInput {
  query: DocumentNode
  variables: Record<string, any>
  config: QueryProcessingConfig
}

interface TestExpected {
  query: DocumentNode
  variables: Record<string, any>
}

function expectProcessed(input: TestInput, expected: TestExpected): void {
  const result = processGql(input.query, input.variables, input.config)
  expect(print(result.query)).toBe(print(expected.query))
  expect(result.variables).toEqual(expected.variables)
}

describe('processGql', () => {
  // ---- Hint: remove-not-defined ------------------------------------------
  describe('Hint "remove-not-defined"', () => {
    it('removes undefined variable via hint', () => {
      expectProcessed(
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
          config: { variables: {} },
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
  })

  // ---- Hint: inline-variable ---------------------------------------------
  describe('Hint "inline-variable"', () => {
    it('inlines a variable via hint', () => {
      expectProcessed(
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
          config: { variables: {} },
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
  })

  // ---- Config: removeIfNotDefined ----------------------------------------
  describe('Config "removeIfNotDefined"', () => {
    it('removes undefined variable by config', () => {
      expectProcessed(
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: undefined },
          config: { variables: { removeIfNotDefined: ['where'] } },
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
  })

  // ---- Config: removeIfNotUsed -------------------------------------------
  describe('Config "removeIfNotUsed"', () => {
    it('removes variable definition when not referenced', () => {
      expectProcessed(
        {
          query: gql`
            query TestQuery($search: String) {
              example {
                totalCount
              }
            }
          `,
          variables: { search: 'hello' },
          config: { variables: { removeIfNotUsed: ['search'] } },
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
  })

  // ---- Config: inline ----------------------------------------------------
  describe('Config "inline"', () => {
    it('inlines a variable by config', () => {
      expectProcessed(
        {
          query: gql`
            query TestQuery($where: String) {
              example(where: $where) {
                totalCount
              }
            }
          `,
          variables: { where: { name: { contains: 'foo' } } },
          config: { variables: { inline: ['where'] } },
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
  })

  // ---- Config: orderTiebreaker -------------------------------------------
  describe('Config "orderTiebreaker"', () => {
    it('appends tiebreaker when not already present', () => {
      const result = processGql(
        gql`
          query TestQuery($order: [SortInput]) {
            example(order: $order) {
              totalCount
            }
          }
        `,
        { order: [{ name: 'ASC' }] },
        { variables: { orderTiebreaker: 'id' } },
      )
      expect(result.variables.order).toEqual([{ name: 'ASC' }, { id: 'DESC' }])
    })

    it('does not duplicate tiebreaker when already present', () => {
      const result = processGql(
        gql`
          query TestQuery($order: [SortInput]) {
            example(order: $order) {
              totalCount
            }
          }
        `,
        { order: [{ id: 'ASC' }] },
        { variables: { orderTiebreaker: 'id' } },
      )
      expect(result.variables.order).toEqual([{ id: 'ASC' }])
    })

    it('does nothing when order is null', () => {
      const result = processGql(
        gql`
          query TestQuery($order: [SortInput]) {
            example(order: $order) {
              totalCount
            }
          }
        `,
        { order: null },
        { variables: { orderTiebreaker: 'id' } },
      )
      expect(result.variables.order).toBeNull()
    })

    it('does nothing when orderTiebreaker is not set', () => {
      const result = processGql(
        gql`
          query TestQuery($order: [SortInput]) {
            example(order: $order) {
              totalCount
            }
          }
        `,
        { order: [{ name: 'ASC' }] },
        { variables: {} },
      )
      expect(result.variables.order).toEqual([{ name: 'ASC' }])
    })
  })

  // ---- Cleanup: empty where ----------------------------------------------
  describe('Cleanup "empty where"', () => {
    it('removes where argument when first field has empty values array', () => {
      const result = processGql(
        gql`
          query TestQuery($skip: Int) {
            example(skip: $skip, where: { status: { in: [] } }) {
              totalCount
            }
          }
        `,
        { skip: 0 },
        { variables: {} },
      )
      expect(print(result.query)).toBe(
        print(gql`
          query TestQuery($skip: Int) {
            example(skip: $skip) {
              totalCount
            }
          }
        `),
      )
    })

    it('keeps where argument when values are present', () => {
      const query = gql`
        query TestQuery($skip: Int) {
          example(skip: $skip, where: { status: { in: ["ACTIVE"] } }) {
            totalCount
          }
        }
      `
      const result = processGql(query, { skip: 0 }, { variables: {} })
      expect(print(result.query)).toBe(print(query))
    })
  })

  // ---- Combined ----------------------------------------------------------
  describe('Combined processing', () => {
    it('applies hints then config in order', () => {
      expectProcessed(
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($skip: Int, $where: String, $search: String) {
              example(skip: $skip, where: $where, search: $search) {
                totalCount
              }
            }
          `,
          variables: { skip: 0, where: undefined, search: 'hello' },
          config: {
            variables: {
              removeIfNotUsed: ['search'],
            },
          },
        },
        {
          query: gql`
            # @gql-hint: remove-not-defined
            query TestQuery($skip: Int, $search: String) {
              example(skip: $skip, search: $search) {
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
