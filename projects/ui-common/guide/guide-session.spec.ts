import { fakeAsync, tick } from '@angular/core/testing'
import { of } from 'rxjs'

import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideEvent } from './models/guide-event'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function makeSession(config: TheSeamGuideConfig) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const events: TheSeamGuideEvent[] = []
  const session = new TheSeamGuideSession(config, adapter, registry, () => {})
  session.events$.subscribe((e) => events.push(e))
  return { adapter, registry, events, session }
}

describe('TheSeamGuideSession transitions', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('runs beforeStep before painting the step', fakeAsync(() => {
    const order: string[] = []
    const { adapter, session } = makeSession({
      steps: [
        {
          popover: { title: 'one' },
          beforeStep: () => void order.push('before'),
        },
      ],
    })
    const origMoveTo = adapter.moveTo.bind(adapter)
    adapter.moveTo = (i: number) => {
      order.push('paint')
      origMoveTo(i)
    }

    session.start()
    tick()

    expect(order).toEqual(['before', 'paint'])
  }))

  it('runs afterStep of the outgoing step before beforeStep of the incoming one', fakeAsync(() => {
    const order: string[] = []
    const { session } = makeSession({
      steps: [
        {
          popover: { title: 'one' },
          afterStep: () => void order.push('after-1'),
        },
        {
          popover: { title: 'two' },
          beforeStep: () => void order.push('before-2'),
        },
      ],
    })

    session.start()
    tick()
    session.next()
    tick()

    expect(order).toEqual(['after-1', 'before-2'])
  }))

  it('awaits a promise returned from beforeStep', fakeAsync(() => {
    let resolved = false
    const { adapter, session } = makeSession({
      steps: [
        {
          popover: { title: 'one' },
          beforeStep: () =>
            new Promise<void>((resolve) =>
              setTimeout(() => {
                resolved = true
                resolve()
              }, 100),
            ),
        },
      ],
    })

    session.start()
    tick(50)
    expect(adapter.calls).not.toContain('moveTo:0')

    tick(50)
    expect(resolved).toBe(true)
    expect(adapter.calls).toContain('moveTo:0')
  }))

  it('awaits an observable returned from beforeStep', fakeAsync(() => {
    const { adapter, session } = makeSession({
      steps: [{ popover: { title: 'one' }, beforeStep: () => of(1) }],
    })

    session.start()
    tick()

    expect(adapter.calls).toContain('moveTo:0')
  }))

  it('waits for a named target that appears later', fakeAsync(() => {
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'late', popover: { title: 'one' } }],
    })

    session.start()
    tick(500)
    expect(adapter.calls).not.toContain('moveTo:0')

    registry.register('late', connectedEl())
    tick()

    expect(adapter.calls).toContain('moveTo:0')
  }))

  it("skips a step whose target never appears when policy is 'skip'", fakeAsync(() => {
    // Default policy 'skip' trips the dev-mode warning tested separately
    // below; suppress it here since this test isn't asserting on it.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { adapter, events, session } = makeSession({
      steps: [
        { element: 'never', popover: { title: 'one' } },
        { popover: { title: 'two' } },
      ],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    expect(events.some((e) => e.type === 'stepSkipped' && e.index === 0)).toBe(
      true,
    )
    expect(adapter.calls).toContain('moveTo:1')
    warn.mockRestore()
  }))

  it("ends the guide when a required step's target never appears", fakeAsync(() => {
    const { events, session } = makeSession({
      steps: [
        { element: 'never', popover: { title: 'one' }, onMissingTarget: 'end' },
        { popover: { title: 'two' } },
      ],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    const closed = events.find((e) => e.type === 'closed')
    expect(closed).toBeDefined()
    expect(closed?.type === 'closed' && closed.result.reason).toBe(
      'targetMissing',
    )
  }))

  it("paints an elementless step when policy is 'elementless'", fakeAsync(() => {
    const { adapter, events, session } = makeSession({
      steps: [
        {
          element: 'never',
          popover: { title: 'one' },
          onMissingTarget: 'elementless',
        },
      ],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    expect(adapter.calls).toContain('moveTo:0')
    expect(events.some((e) => e.type === 'stepChanged' && e.index === 0)).toBe(
      true,
    )
  }))

  it('ends rather than looping when every remaining step misses', fakeAsync(() => {
    // Default policy 'skip' trips the dev-mode warning (once per missed
    // step) tested separately below; suppress it here since this test isn't
    // asserting on it.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { events, session } = makeSession({
      steps: [
        { element: 'never-a', popover: { title: 'one' } },
        { element: 'never-b', popover: { title: 'two' } },
      ],
      targetTimeout: 500,
    })

    session.start()
    tick(500)
    tick()
    tick(500)
    tick()

    expect(events.some((e) => e.type === 'closed')).toBe(true)
    warn.mockRestore()
  }))

  it('warns in dev mode when a step is skipped', fakeAsync(() => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { session } = makeSession({
      steps: [
        { element: 'never', popover: { title: 'one' } },
        { popover: { title: 'two' } },
      ],
      targetTimeout: 500,
    })

    session.start()
    tick(500)
    tick()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('never'))
    warn.mockRestore()
  }))

  it('abandons an in-flight transition when a new one starts', fakeAsync(() => {
    const { adapter, registry, session } = makeSession({
      steps: [
        { popover: { title: 'one' } },
        { element: 'slow', popover: { title: 'two' } },
        { popover: { title: 'three' } },
      ],
      targetTimeout: 5000,
    })

    session.start()
    tick()
    session.next()
    tick(100)

    session.moveTo(2)
    tick()

    expect(adapter.calls).toContain('moveTo:2')
    expect(adapter.calls).not.toContain('moveTo:1')

    // Prove real cancellation, not merely that the target hasn't resolved
    // yet: if the abandoned transition to index 1 were still subscribed,
    // satisfying its target now would paint it.
    registry.register('slow', connectedEl())
    tick(5000)
    expect(adapter.calls).not.toContain('moveTo:1')
  }))

  it('does not paint after the guide is closed', fakeAsync(() => {
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'late', popover: { title: 'one' } }],
      targetTimeout: 5000,
    })

    session.start()
    tick(100)
    session.close('dismissed')

    registry.register('late', connectedEl())
    tick(1000)

    expect(adapter.calls).not.toContain('moveTo:0')
  }))
})
