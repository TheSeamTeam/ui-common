import { seamFileItemFromFile } from './file-item.utils'

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
