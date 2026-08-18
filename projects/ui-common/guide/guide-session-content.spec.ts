import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuidePopover } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function makeSession(
  config: TheSeamGuideConfig,
  popoverDefaults: TheSeamGuidePopover = {},
) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    popoverDefaults,
    onClosed: () => {},
  })
  return { adapter, session }
}

function popoverAt(adapter: FakeGuideAdapter, index: number) {
  return adapter.startedConfig?.steps[index]?.popover
}

describe('TheSeamGuideSession popover layers', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses the session layer when the step omits a slot', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { description: 'Step one.' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBe('Guide title')
    expect(popoverAt(adapter, 0)?.description).toBe('Step one.')
    session.close('destroyed')
  }))

  it('lets the step override the session layer', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { title: 'Step title' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBe('Step title')
    session.close('destroyed')
  }))

  it('lets the step clear a session-supplied slot with null', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { title: null, description: 'Step one.' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBeUndefined()
    expect(popoverAt(adapter, 0)?.description).toBe('Step one.')
    session.close('destroyed')
  }))

  it('does not let the provider layer create a slot', fakeAsync(() => {
    const { adapter, session } = makeSession(
      { steps: [{ popover: { description: 'Step one.' } }] },
      { title: 'Provider title' },
    )
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBeUndefined()
    session.close('destroyed')
  }))

  it('layers side and align nearest-wins', fakeAsync(() => {
    const { adapter, session } = makeSession(
      {
        popover: { side: 'bottom' },
        steps: [
          { popover: { description: 'One.' } },
          { popover: { description: 'Two.', side: 'left', align: 'end' } },
        ],
      },
      { side: 'top', align: 'center' },
    )
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.side).toBe('bottom')
    expect(popoverAt(adapter, 0)?.align).toBe('center')
    expect(popoverAt(adapter, 1)?.side).toBe('left')
    expect(popoverAt(adapter, 1)?.align).toBe('end')
    session.close('destroyed')
  }))

  it('omits the popover entirely when no layer supplies anything', fakeAsync(() => {
    const { adapter, session } = makeSession({ steps: [{}] })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)).toBeUndefined()
    session.close('destroyed')
  }))
})
