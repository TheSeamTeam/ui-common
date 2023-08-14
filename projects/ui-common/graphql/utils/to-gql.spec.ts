import { gql } from 'apollo-angular'
import { parseValue, print } from 'graphql/language'
import { GQLDirection } from './../models/direction'

import { toGQL } from './to-gql'

describe('GraphQL Utils toGql', () => {
  it('should handle single string prop', () => {
    const input = { prop: 'thing' }
    const output = toGQL(input)

    const expectedOutput = '{prop: "thing"}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single number prop', () => {
    const input = { prop: 2 }
    const output = toGQL(input)

    const expectedOutput = '{prop: 2}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single direction prop', () => {
    const input = { prop: GQLDirection.ASC }
    const output = toGQL(input)

    const expectedOutput = '{prop: ASC}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single variable prop', () => {
    const input = { prop: { gqlVar: '$thing' } }
    const output = toGQL(input)

    const expectedOutput = '{prop: $thing}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single array prop with single object', () => {
    const input = { prop: [ { prop2: 2 } ] }
    const output = toGQL(input)

    const expectedOutput = '{prop: [{prop2: 2}]}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single array prop with multiple objects', () => {
    const input = { prop: [ { prop2: 2 }, { prop3: 3 } ] }
    const output = toGQL(input)

    const expectedOutput = '{prop: [{prop2: 2},{prop3: 3}]}'

    expect(output).toBe(expectedOutput)
  })
})
