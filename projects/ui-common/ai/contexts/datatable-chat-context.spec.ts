import gql from 'graphql-tag'

import { TheSeamDatatableChatContext } from './datatable-chat-context'

function makeQueryRef(opts: {
  query?: ReturnType<typeof gql>
  variables?: Record<string, unknown>
  config?: Record<string, unknown>
  optionsUndefined?: boolean
}) {
  return {
    getOptions: () =>
      opts.optionsUndefined
        ? undefined
        : { query: opts.query!, variables: opts.variables ?? {} },
    getVariables: () => opts.variables ?? {},
    getQueryProcessingConfig: () => opts.config ?? { variables: {} },
  } as any
}

describe('TheSeamDatatableChatContext', () => {
  const QUERY = gql`
    query BaleList($skip: Int, $take: Int) {
      baleList(skip: $skip, take: $take) {
        items {
          id
          warehouseTag
        }
      }
    }
  `

  it('type is "datatable"', () => {
    const context = new TheSeamDatatableChatContext(
      makeQueryRef({ query: QUERY, variables: { skip: 0, take: 10 } }),
      [{ prop: 'id', name: 'Bale Id' }] as any,
    )

    expect(context.type).toBe('datatable')
  })

  it('returns null when getOptions is undefined', () => {
    const context = new TheSeamDatatableChatContext(
      makeQueryRef({ optionsUndefined: true }),
      [] as any,
    )

    expect(context.getContext()).toBeNull()
  })

  it('exposes operationName, query string, variables, and columns', () => {
    const context = new TheSeamDatatableChatContext(
      makeQueryRef({ query: QUERY, variables: { skip: 0, take: 10 } }),
      [
        { prop: 'id', name: 'Bale Id' },
        { prop: 'warehouseTag', name: 'Warehouse Tag' },
      ] as any,
    )

    const data = context.getContext() as any

    expect(data.operationName).toBe('BaleList')
    expect(data.query).toContain('query BaleList')
    expect(data.variables).toEqual({ skip: 0, take: 10 })
    expect(data.columns).toEqual([
      { prop: 'id', name: 'Bale Id' },
      { prop: 'warehouseTag', name: 'Warehouse Tag' },
    ])
  })

  it('passes the optional label through', () => {
    const context = new TheSeamDatatableChatContext(
      makeQueryRef({ query: QUERY, variables: { skip: 0, take: 10 } }),
      [{ prop: 'id', name: 'Bale Id' }] as any,
      { label: 'Bales' },
    )

    expect((context.getContext() as any).label).toBe('Bales')
  })

  it('omits label when not provided', () => {
    const context = new TheSeamDatatableChatContext(
      makeQueryRef({ query: QUERY, variables: { skip: 0, take: 10 } }),
      [{ prop: 'id', name: 'Bale Id' }] as any,
    )

    expect((context.getContext() as any).label).toBeUndefined()
  })
})
