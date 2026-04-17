import { parseChatResponse, ChatContentSegment } from './chat-response-parser'

describe('parseChatResponse', () => {
  it('should return a single markdown segment for plain text', () => {
    const result = parseChatResponse('Hello, world!')
    expect(result).toEqual([{ type: 'markdown', content: 'Hello, world!' }])
  })

  it('should return a single markdown segment for standard fenced blocks', () => {
    const input = 'Here is code:\n\n```json\n{"key": "value"}\n```\n\nDone.'
    const result = parseChatResponse(input)
    expect(result).toEqual([{ type: 'markdown', content: input }])
  })

  it('should extract a seam- prefixed block as a custom-block segment', () => {
    const input =
      'Here is data:\n\n```seam-table\n{"columns":["A"],"rows":[["1"]]}\n```\n\nEnd.'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'markdown', content: 'Here is data:\n\n' },
      {
        type: 'custom-block',
        tag: 'seam-table',
        content: '{"columns":["A"],"rows":[["1"]]}',
      },
      { type: 'markdown', content: '\n\nEnd.' },
    ])
  })

  it('should handle multiple custom blocks', () => {
    const input =
      'Table:\n\n```seam-table\ntable-data\n```\n\nChart:\n\n```seam-chart\nchart-data\n```\n\nDone.'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'markdown', content: 'Table:\n\n' },
      { type: 'custom-block', tag: 'seam-table', content: 'table-data' },
      { type: 'markdown', content: '\n\nChart:\n\n' },
      { type: 'custom-block', tag: 'seam-chart', content: 'chart-data' },
      { type: 'markdown', content: '\n\nDone.' },
    ])
  })

  it('should handle a custom block with no surrounding text', () => {
    const input = '```seam-table\ndata\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'custom-block', tag: 'seam-table', content: 'data' },
    ])
  })

  it('should return an empty array for an empty string', () => {
    const result = parseChatResponse('')
    expect(result).toEqual([])
  })

  it('should handle a custom block with empty content', () => {
    const input = '```seam-table\n\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'custom-block', tag: 'seam-table', content: '' },
    ])
  })

  it('should not treat seam- blocks inside standard blocks as custom', () => {
    const input = '```typescript\nconst x = `seam-table`\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([{ type: 'markdown', content: input }])
  })
})
