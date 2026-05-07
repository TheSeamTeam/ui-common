import { TheSeamChatContext } from './chat-context'
import { TheSeamChatContextRegistry } from './chat-context-registry.service'

function ctx(
  type: string,
  data: unknown,
  opts: { alwaysVisible?: boolean } = {},
): TheSeamChatContext {
  return {
    type,
    alwaysVisible: opts.alwaysVisible,
    getContext: () => data,
  }
}

describe('TheSeamChatContextRegistry', () => {
  let registry: TheSeamChatContextRegistry

  beforeEach(() => {
    registry = new TheSeamChatContextRegistry()
  })

  it('snapshot returns registered contexts as payloads', async () => {
    registry.register(ctx('datatable', { foo: 1 }))

    const snap = await registry.snapshot()

    expect(snap).toEqual([{ type: 'datatable', data: { foo: 1 } }])
  })

  it('register returns an unregister function that detaches the context', async () => {
    const off = registry.register(ctx('datatable', { foo: 1 }))

    off()

    expect(await registry.snapshot()).toEqual([])
  })

  it('unregister removes a previously registered context', async () => {
    const c = ctx('datatable', { foo: 1 })
    registry.register(c)

    registry.unregister(c)

    expect(await registry.snapshot()).toEqual([])
  })

  it('drops contexts whose getContext returns null', async () => {
    registry.register({ type: 'datatable', getContext: () => null })

    expect(await registry.snapshot()).toEqual([])
  })

  it('drops contexts whose getContext returns undefined', async () => {
    registry.register({ type: 'datatable', getContext: () => undefined })

    expect(await registry.snapshot()).toEqual([])
  })

  it('awaits async getContext results', async () => {
    registry.register({
      type: 'datatable',
      getContext: () => Promise.resolve({ async: true }),
    })

    const snap = await registry.snapshot()

    expect(snap).toEqual([{ type: 'datatable', data: { async: true } }])
  })

  it('when a modal context is registered, masks non-modal contexts', async () => {
    registry.register(ctx('datatable', { foo: 1 }))
    registry.register(ctx('modal', { open: 'about' }))

    const snap = await registry.snapshot()

    expect(snap).toEqual([{ type: 'modal', data: { open: 'about' } }])
  })

  it('alwaysVisible contexts pass through modal masking', async () => {
    registry.register(ctx('datatable', { foo: 1 }, { alwaysVisible: true }))
    registry.register(ctx('modal', { open: 'about' }))

    const snap = await registry.snapshot()

    expect(snap).toEqual(
      expect.arrayContaining([
        { type: 'datatable', data: { foo: 1 } },
        { type: 'modal', data: { open: 'about' } },
      ]),
    )
    expect(snap.length).toBe(2)
  })

  it('returns empty array when nothing is registered', async () => {
    expect(await registry.snapshot()).toEqual([])
  })
})
