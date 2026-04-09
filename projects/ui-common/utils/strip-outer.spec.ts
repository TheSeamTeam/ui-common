import { stripOuter } from './strip-outer'

describe('stripOuter', () => {
  it('should strip substring from both start and end', () => {
    expect(stripOuter('_foo_', '_')).toBe('foo')
  })

  it('should strip substring from start only', () => {
    expect(stripOuter('_foo', '_')).toBe('foo')
  })

  it('should strip substring from end only', () => {
    expect(stripOuter('foo_', '_')).toBe('foo')
  })

  it('should return the string unchanged when substring is not at edges', () => {
    expect(stripOuter('foo_bar', '_')).toBe('foo_bar')
  })

  it('should handle multi-character substrings', () => {
    expect(stripOuter('abcfooabc', 'abc')).toBe('foo')
  })

  it('should handle regex special characters in substring', () => {
    expect(stripOuter('...foo...', '...')).toBe('foo')
    expect(stripOuter('(foo(', '(')).toBe('foo')
  })

  it('should only strip one occurrence from each end', () => {
    expect(stripOuter('__foo__', '_')).toBe('_foo_')
  })

  it('should handle empty string', () => {
    expect(stripOuter('', '_')).toBe('')
  })
})
