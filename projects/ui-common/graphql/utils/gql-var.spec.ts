import { gqlVar } from './gql-var'
import { toGQL } from './to-gql'

describe('gqlVar', () => {
  it('returns an object with gqlVar property prefixed with $', () => {
    expect(gqlVar('search')).toEqual({ gqlVar: '$search' })
  })

  it('produces a variable reference when used with toGQL', () => {
    const filter = { name: { contains: gqlVar('search') } }
    expect(toGQL(filter)).toBe('{name: {contains: $search}}')
  })
})
