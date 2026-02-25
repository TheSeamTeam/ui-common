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
    const input = { prop: [{ prop2: 2 }] }
    const output = toGQL(input)

    const expectedOutput = '{prop: [{prop2: 2}]}'

    expect(output).toBe(expectedOutput)
  })

  it('should handle single array prop with multiple objects', () => {
    const input = { prop: [{ prop2: 2 }, { prop3: 3 }] }
    const output = toGQL(input)

    const expectedOutput = '{prop: [{prop2: 2},{prop3: 3}]}'

    expect(output).toBe(expectedOutput)
  })

  describe('primitive top-level values', () => {
    it('should handle a top-level string', () => {
      expect(toGQL('hello')).toBe('"hello"')
    })

    it('should handle a top-level integer', () => {
      expect(toGQL(42)).toBe('42')
    })

    it('should handle a top-level float', () => {
      expect(toGQL(3.14)).toBe('3.14')
    })

    it('should handle a top-level boolean true', () => {
      expect(toGQL(true)).toBe('true')
    })

    it('should handle a top-level boolean false', () => {
      expect(toGQL(false)).toBe('false')
    })

    it('should handle a top-level null', () => {
      expect(toGQL(null)).toBe('null')
    })

    it('should handle a top-level array', () => {
      expect(toGQL([{ prop: 1 }, { prop: 2 }])).toBe('[{prop: 1},{prop: 2}]')
    })
  })
})
