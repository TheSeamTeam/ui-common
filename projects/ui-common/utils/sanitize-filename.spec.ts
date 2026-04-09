import { sanitizeFilename } from './sanitize-filename'

describe('sanitizeFilename', () => {
  it('should replace reserved characters with the default replacement', () => {
    expect(sanitizeFilename('foo:bar')).toBe('foo_bar')
    expect(sanitizeFilename('foo<bar>baz')).toBe('foo_bar_baz')
    expect(sanitizeFilename('foo|bar')).toBe('foo_bar')
  })

  it('should replace control characters', () => {
    expect(sanitizeFilename('foo\x00bar')).toBe('foo_bar')
    expect(sanitizeFilename('foo\x1Fbar')).toBe('foo_bar')
  })

  it('should replace relative path dots at start', () => {
    // '..' replaced -> '__foo', trimRepeated -> '_foo', stripOuter strips leading '_' -> 'foo'
    expect(sanitizeFilename('..foo')).toBe('foo')
  })

  it('should collapse repeated replacement characters', () => {
    expect(sanitizeFilename('foo:::bar')).toBe('foo_bar')
  })

  it('should strip replacement character from edges (length > 1)', () => {
    expect(sanitizeFilename(':foo:')).toBe('foo')
  })

  it('should append replacement to reserved Windows names', () => {
    expect(sanitizeFilename('con')).toBe('con_')
    expect(sanitizeFilename('PRN')).toBe('PRN_')
    expect(sanitizeFilename('COM1')).toBe('COM1_')
  })

  it('should truncate to maxLength', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeFilename(long).length).toBe(100)
  })

  it('should respect custom maxLength', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeFilename(long, { maxLength: 50 }).length).toBe(50)
  })

  it('should use custom replacement string', () => {
    expect(sanitizeFilename('foo:bar', { replacement: '-' })).toBe('foo-bar')
  })

  it('should handle empty replacement', () => {
    expect(sanitizeFilename('foo:bar', { replacement: '' })).toBe('foobar')
  })

  it('should leave clean filenames unchanged', () => {
    expect(sanitizeFilename('my-file.txt')).toBe('my-file.txt')
  })
})
