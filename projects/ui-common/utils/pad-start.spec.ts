import { padStart } from './pad-start'

describe('padStart', () => {
  it('should pad remaining characters', () => {
    expect(padStart('abcd', 8, '*')).toBe('****abcd')
    expect(padStart('abcd', 6, '***')).toBe('**abcd')
    expect(padStart('abcd', 4, '*')).toBe('abcd')
    expect(padStart('abcd', 3, '*')).toBe('abcd')
    expect(padStart('abcd', 0, '*')).toBe('abcd')
  })
})
