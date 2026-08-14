import { FakeGuideAdapter } from './fake-guide.adapter'

describe('FakeGuideAdapter', () => {
  it('records the config it was started with and reports active', () => {
    const adapter = new FakeGuideAdapter()
    expect(adapter.isActive()).toBe(false)

    adapter.start(
      { steps: [{ popover: { title: 'one' } }], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )

    expect(adapter.isActive()).toBe(true)
    expect(adapter.startedConfig?.steps).toHaveLength(1)
  })

  it('records moveTo and refresh calls in order', () => {
    const adapter = new FakeGuideAdapter()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )

    adapter.moveTo(0)
    adapter.refresh()
    adapter.moveTo(1)

    expect(adapter.calls).toEqual(['start', 'moveTo:0', 'refresh', 'moveTo:1'])
  })

  it('routes emitted user intent to the registered callbacks', () => {
    const adapter = new FakeGuideAdapter()
    const next = jest.fn()
    const close = jest.fn()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      {
        onNextRequested: next,
        onPreviousRequested: () => {},
        onCloseRequested: close,
      },
    )

    adapter.emitNext()
    adapter.emitClose()

    expect(next).toHaveBeenCalledTimes(1)
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('is no longer active after destroy', () => {
    const adapter = new FakeGuideAdapter()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )
    adapter.destroy()
    expect(adapter.isActive()).toBe(false)
  })

  it('drops its callbacks on destroy so emitted intent after destroy is not delivered', () => {
    const adapter = new FakeGuideAdapter()
    const next = jest.fn()
    const previous = jest.fn()
    const close = jest.fn()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      {
        onNextRequested: next,
        onPreviousRequested: previous,
        onCloseRequested: close,
      },
    )

    adapter.destroy()
    adapter.emitNext()
    adapter.emitPrevious()
    adapter.emitClose()

    expect(next).not.toHaveBeenCalled()
    expect(previous).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })
})
