import { gql } from 'apollo-angular'
import { print } from 'graphql'

import { removeVariable } from './remove-variable'

describe('removeVariable', () => {
  it('removes both the definition and argument reference', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariable(query, 'where')
    expect(print(result)).toBe(
      print(gql`
        query TestQuery($skip: Int) {
          example(skip: $skip) {
            totalCount
          }
        }
      `),
    )
  })

  it('leaves other variables intact', () => {
    const query = gql`
      query TestQuery($skip: Int, $take: Int, $where: String) {
        example(skip: $skip, take: $take, where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariable(query, 'where')
    expect(print(result)).toContain('$skip: Int')
    expect(print(result)).toContain('$take: Int')
    expect(print(result)).toContain('skip: $skip')
    expect(print(result)).toContain('take: $take')
  })

  it('handles removing the only variable', () => {
    const query = gql`
      query TestQuery($where: String) {
        example(where: $where) {
          totalCount
        }
      }
    `
    const result = removeVariable(query, 'where')
    expect(print(result)).toBe(
      print(gql`
        query TestQuery {
          example {
            totalCount
          }
        }
      `),
    )
  })

  it('is a no-op when variable does not exist', () => {
    const query = gql`
      query TestQuery($skip: Int) {
        example(skip: $skip) {
          totalCount
        }
      }
    `
    const result = removeVariable(query, 'where')
    expect(print(result)).toBe(print(query))
  })
})
