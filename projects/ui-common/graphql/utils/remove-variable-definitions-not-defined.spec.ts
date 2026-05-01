import { gql } from 'apollo-angular'
import { OperationDefinitionNode, print } from 'graphql'

import { removeVariableDefinitionsNotDefined } from './remove-variable-definitions-not-defined'

function getOperationNode(query: any): OperationDefinitionNode {
  return query.definitions.find(
    (d: any) => d.kind === 'OperationDefinition',
  ) as OperationDefinitionNode
}

describe('removeVariableDefinitionsNotDefined', () => {
  it('removes definitions for variables that are null or undefined', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String, $order: String) {
        example(skip: $skip, where: $where, order: $order) {
          totalCount
        }
      }
    `
    const variables = { skip: 0, where: null, order: undefined }
    const result = removeVariableDefinitionsNotDefined(
      query,
      getOperationNode(query),
      variables,
    )
    expect(print(result)).toBe(
      print(gql`
        query TestQuery($skip: Int) {
          example(skip: $skip, where: $where, order: $order) {
            totalCount
          }
        }
      `),
    )
  })

  it('keeps definitions for variables that have values', () => {
    const query = gql`
      query TestQuery($skip: Int, $search: String) {
        example(skip: $skip, search: $search) {
          totalCount
        }
      }
    `
    const variables = { skip: 0, search: 'hello' }
    const result = removeVariableDefinitionsNotDefined(
      query,
      getOperationNode(query),
      variables,
    )
    expect(print(result)).toBe(print(query))
  })

  it('does not remove argument references', () => {
    const query = gql`
      query TestQuery($where: String) {
        example(where: $where) {
          totalCount
        }
      }
    `
    const variables = { where: undefined }
    const result = removeVariableDefinitionsNotDefined(
      query,
      getOperationNode(query),
      variables,
    )
    expect(print(result)).toContain('where: $where')
  })
})
