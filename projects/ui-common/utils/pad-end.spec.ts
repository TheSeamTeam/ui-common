import { padEnd } from './pad-end'

describe('padEnd', () => {
  it('should pad remaining characters', () => {
    expect(padEnd('abcd', 8, '*')).toBe('abcd****')
    expect(padEnd('abcd', 6, '***')).toBe('abcd**')
    expect(padEnd('abcd', 4, '*')).toBe('abcd')
    expect(padEnd('abcd', 3, '*')).toBe('abcd')
    expect(padEnd('abcd', 0, '*')).toBe('abcd')
  })
})
