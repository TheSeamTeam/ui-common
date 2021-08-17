import { fractionalDigitsCount } from './fractional-digits-count'

describe('fractionalDigitsCount', () => {
  it('should return null for invalid inputs', () => {
    expect(fractionalDigitsCount('')).toBeNull()
    expect(fractionalDigitsCount('..')).toBeNull()
    expect(fractionalDigitsCount('0.0.')).toBeNull()
    expect(fractionalDigitsCount('.0.0')).toBeNull()
    expect(fractionalDigitsCount('a')).toBeNull()
    expect(fractionalDigitsCount('-')).toBeNull()
  })

  it('should return fractional digit count', () => {
    expect(fractionalDigitsCount('.')).toBe(0)
    expect(fractionalDigitsCount('.0')).toBe(1)
    expect(fractionalDigitsCount('.1')).toBe(1)
    expect(fractionalDigitsCount('.10')).toBe(2)
    expect(fractionalDigitsCount('.123456')).toBe(6)
    expect(fractionalDigitsCount('1.1')).toBe(1)
    expect(fractionalDigitsCount('123.1234')).toBe(4)
  })
})
