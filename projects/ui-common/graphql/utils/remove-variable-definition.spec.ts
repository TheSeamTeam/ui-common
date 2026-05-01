import { gql } from 'apollo-angular'
import { print } from 'graphql'

import { removeVariableDefinition } from './remove-variable-definition'

describe('removeVariableDefinition', () => {
  it('removes the named variable definition', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariableDefinition(query, 'where')
    expect(print(result)).toBe(
      print(gql`
        query TestQuery($skip: Int) {
          example(skip: $skip, where: $where) {
            totalCount
          }
        }
      `),
    )
  })

  it('does not remove argument references to the variable', () => {
    const query = gql`
      query TestQuery($where: String) {
        example(where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariableDefinition(query, 'where')
    expect(print(result)).toContain('where: $where')
  })

  it('leaves other variable definitions intact', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariableDefinition(query, 'where')
    expect(print(result)).toContain('$skip: Int')
  })
})
