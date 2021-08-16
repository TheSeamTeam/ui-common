import { createPadding } from './create-padding'

describe('createPadding', () => {
  it('should create padding', () => {
    expect(createPadding(3, '*')).toBe('***')
    expect(createPadding(3, '**')).toBe('***')
    expect(createPadding(3, '***')).toBe('***')
    expect(createPadding(3, '****')).toBe('***')

    expect(createPadding(3, 'abc')).toBe('abc')
    expect(createPadding(3, 'ab')).toBe('aba')
    expect(createPadding(4, 'abc')).toBe('abca')
  })
})
