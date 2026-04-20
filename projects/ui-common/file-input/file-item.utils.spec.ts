import { seamFileItemFromFile } from './file-item.utils'
import { seamFileItemFromUrl } from './file-item.utils'

describe('seamFileItemFromFile', () => {
  it('wraps a File into a SeamFileItem with a file source', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    const item = seamFileItemFromFile(file)

    expect(item.name).toBe('hello.txt')
    expect(item.type).toBe('text/plain')
    expect(item.size).toBe(file.size)
    expect(item.source).toEqual({ kind: 'file', file })
    expect(item.id).toBeUndefined()
  })

  it('accepts an id argument', () => {
    const file = new File(['x'], 'x.txt')

    const item = seamFileItemFromFile(file, 'abc-123')

    expect(item.id).toBe('abc-123')
  })
})

describe('seamFileItemFromUrl', () => {
  it('wraps a URL into a SeamFileItem with url source', () => {
    const item = seamFileItemFromUrl('https://example.com/files/logo.png')

    expect(item.source).toEqual({
      kind: 'url',
      url: 'https://example.com/files/logo.png',
    })
  })

  it('defaults name to the URL basename', () => {
    const item = seamFileItemFromUrl('https://example.com/path/to/logo.png')

    expect(item.name).toBe('logo.png')
  })

  it('decodes URL-encoded basenames', () => {
    const item = seamFileItemFromUrl('https://example.com/files/my%20file.pdf')

    expect(item.name).toBe('my file.pdf')
  })

  it('strips query strings and fragments when deriving name', () => {
    const item = seamFileItemFromUrl('https://example.com/file.pdf?v=2#page=1')

    expect(item.name).toBe('file.pdf')
  })

  it('falls back to the url as name when basename cannot be derived', () => {
    const item = seamFileItemFromUrl('https://example.com/')

    expect(item.name).toBe('https://example.com/')
  })

  it('accepts overrides for name, type, size, id, thumbnailUrl', () => {
    const item = seamFileItemFromUrl('https://example.com/logo.png', {
      name: 'Brand Logo',
      type: 'image/png',
      size: 12345,
      id: 'doc-1',
      thumbnailUrl: 'https://example.com/logo-thumb.png',
    })

    expect(item.name).toBe('Brand Logo')
    expect(item.type).toBe('image/png')
    expect(item.size).toBe(12345)
    expect(item.id).toBe('doc-1')
    expect(item.thumbnailUrl).toBe('https://example.com/logo-thumb.png')
  })
})

import { seamFilesFromItems } from './file-item.utils'

describe('seamFilesFromItems', () => {
  it('returns File objects from items with file source', () => {
    const f1 = new File(['a'], 'a.txt')
    const f2 = new File(['b'], 'b.txt')

    const result = seamFilesFromItems([
      { name: 'a.txt', source: { kind: 'file', file: f1 } },
      { name: 'b.txt', source: { kind: 'file', file: f2 } },
    ])

    expect(result).toEqual([f1, f2])
  })

  it('omits items with non-file sources', () => {
    const f = new File(['a'], 'a.txt')

    const result = seamFilesFromItems([
      { name: 'a.txt', source: { kind: 'file', file: f } },
      { name: 'b.png', source: { kind: 'url', url: 'https://x/b.png' } },
      { name: 'c.bin', source: { kind: 'blob', blob: new Blob(['c']) } },
    ])

    expect(result).toEqual([f])
  })

  it('returns an empty array for an empty input', () => {
    expect(seamFilesFromItems([])).toEqual([])
  })
})
