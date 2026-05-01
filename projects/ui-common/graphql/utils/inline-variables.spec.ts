import { gql } from 'apollo-angular'
import { parseValue, print } from 'graphql'

import { inlineVariable } from './inline-variables'

describe('inlineVariable', () => {
  it('replaces a variable reference with a literal value', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = inlineVariable(query, 'where', parseValue('{id: {eq: 5}}'))
    expect(print(result)).toBe(
      print(gql`
        query TestQuery($skip: Int, $where: String) {
          example(skip: $skip, where: { id: { eq: 5 } }) {
            totalCount
          }
        }
      `),
    )
  })

  it('leaves other variables intact', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = inlineVariable(query, 'where', parseValue('{id: {eq: 5}}'))
    expect(print(result)).toContain('$skip')
  })

  it('does not remove the variable definition', () => {
    const query = gql`
      query TestQuery($where: String) {
        example(where: $where) {
          totalCount
        }
      }
    `
    const result = inlineVariable(query, 'where', parseValue('{id: {eq: 5}}'))
    // The definition $where: String should still be present
    expect(print(result)).toContain('$where: String')
  })

  it('removes the variable reference when value is undefined', () => {
    const query = gql`
      query TestQuery($skip: Int, $where: String) {
        example(skip: $skip, where: $where) {
          totalCount
        }
      }
    `
    const result = inlineVariable(query, 'where', parseValue('undefined'))
    expect(print(result)).not.toContain('where: $where')
    // skip should still be present
    expect(print(result)).toContain('skip: $skip')
  })
})
