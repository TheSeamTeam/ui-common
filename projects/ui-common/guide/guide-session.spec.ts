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

  // Placed in afterEach rather than an inline `warn.mockRestore()` at the
  // end of each test body: if an assertion above an inline restore throws,
  // the restore never runs and the spy leaks into later tests, silently
  // swallowing their warnings too.
  afterEach(() => {
    jest.restoreAllMocks()
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
    jest.spyOn(console, 'warn').mockImplementation(() => {})
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
    jest.spyOn(console, 'warn').mockImplementation(() => {})
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

  it("does not re-run the outgoing step's afterStep when a later step is skipped", fakeAsync(() => {
    // Default policy 'skip' trips the dev-mode warning tested separately
    // above; suppress it here since this test isn't asserting on it.
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    let afterCount = 0
    const { adapter, session } = makeSession({
      steps: [
        { popover: { title: 'A' }, afterStep: () => void afterCount++ },
        { element: 'never', popover: { title: 'B' } },
        { popover: { title: 'C' } },
      ],
      targetTimeout: 500,
    })

    session.start()
    tick() // paints A
    session.next()
    tick(500) // B's target times out; miss policy re-requests C
    tick() // flushes that re-request, painting C

    expect(afterCount).toBe(1)
    expect(adapter.calls).toContain('moveTo:2')
  }))

  it('stays responsive to a subsequent moveTo after a hook throws', fakeAsync(() => {
    // The thrown error trips a dev-mode warning from the transition's own
    // catchError; suppress it here since this test isn't asserting on it.
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { adapter, session } = makeSession({
      steps: [
        { popover: { title: 'one' } },
        {
          popover: { title: 'two' },
          onMissingTarget: 'elementless',
          beforeStep: () => {
            throw new Error('boom')
          },
        },
        { popover: { title: 'three' } },
      ],
    })

    session.start()
    tick()
    session.next()
    tick()

    // The failing transition must be contained to itself rather than
    // unsubscribing the outer transition pipeline; otherwise every
    // subsequent call below would become a silent no-op.
    session.moveTo(2)
    tick()

    expect(adapter.calls).toContain('moveTo:2')
  }))

  it('treats an invalid CSS selector as a waitable name instead of throwing', fakeAsync(() => {
    // '#1-invalid' is not a valid CSS selector (an ID cannot start with a
    // digit) — `document.querySelector` throws on it directly. 'my target'
    // (the other name suggested for this case) turned out not to work: a
    // bare space is a valid descendant-combinator selector, so it never
    // reaches the catch branch.
    const { adapter, registry, session } = makeSession({
      steps: [{ element: '#1-invalid', popover: { title: 'one' } }],
      targetTimeout: 5000,
    })

    expect(() => session.start()).not.toThrow()
    tick(100)
    expect(adapter.calls).not.toContain('moveTo:0')

    registry.register('#1-invalid', connectedEl())
    tick()

    expect(adapter.calls).toContain('moveTo:0')
  }))
})
