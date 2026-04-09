import { trimRepeated } from './trim-repeated'

describe('trimRepeated', () => {
  it('should collapse repeated substrings to a single occurrence', () => {
    expect(trimRepeated('foo--bar---baz', '-')).toBe('foo-bar-baz')
  })

  it('should leave single occurrences untouched', () => {
    expect(trimRepeated('foo-bar-baz', '-')).toBe('foo-bar-baz')
  })

  it('should handle multi-character targets', () => {
    expect(trimRepeated('fooabababbar', 'ab')).toBe('fooabbar')
  })

  it('should handle regex special characters in target', () => {
    expect(trimRepeated('foo...bar......baz', '...')).toBe('foo...bar...baz')
    expect(trimRepeated('a**b****c', '**')).toBe('a**b**c')
  })

  it('should return the string unchanged when no repeats exist', () => {
    expect(trimRepeated('hello world', '-')).toBe('hello world')
  })

  it('should handle empty string', () => {
    expect(trimRepeated('', '-')).toBe('')
  })

  it('should handle repeats at start and end', () => {
    expect(trimRepeated('---foo---', '-')).toBe('-foo-')
  })
})
