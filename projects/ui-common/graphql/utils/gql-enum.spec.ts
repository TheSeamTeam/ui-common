import { gqlEnum } from './gql-enum'
import { toGQL } from './to-gql'

describe('gqlEnum', () => {
  it('formats camelCase as SCREAMING_SNAKE_CASE by default', () => {
    expect(gqlEnum('camelCase')).toEqual({ gqlEnum: 'CAMEL_CASE' })
  })

  it('replaces spaces with underscores and uppercases', () => {
    expect(gqlEnum('with space')).toEqual({ gqlEnum: 'WITH_SPACE' })
  })

  it('uppercases a single lowercase word', () => {
    expect(gqlEnum('active')).toEqual({ gqlEnum: 'ACTIVE' })
  })

  it('does not produce a leading underscore for an initial capital letter', () => {
    expect(gqlEnum('PascalCase')).toEqual({ gqlEnum: 'PASCAL_CASE' })
  })

  it('passes through verbatim when formatAsEnum is false', () => {
    expect(gqlEnum('ALREADY_FORMATTED', false)).toEqual({
      gqlEnum: 'ALREADY_FORMATTED',
    })
  })

  it('produces an enum value when used with toGQL on an object property', () => {
    expect(toGQL({ status: gqlEnum('active') })).toBe('{status: ACTIVE}')
  })
})
