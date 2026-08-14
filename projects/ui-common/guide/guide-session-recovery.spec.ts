import { fakeAsync, tick } from '@angular/core/testing'

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

describe('TheSeamGuideSession mid-step target loss', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('emits targetLost when the active step target unregisters', fakeAsync(() => {
    const el = connectedEl()
    const { registry, events, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick()

    expect(events.some((e) => e.type === 'targetLost' && e.index === 0)).toBe(
      true,
    )
  }))

  it('recovers within grace without re-running hooks or emitting stepChanged', fakeAsync(() => {
    const beforeStep = jest.fn()
    const afterStep = jest.fn()
    const el = connectedEl()
    const { adapter, registry, events, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' }, beforeStep, afterStep },
      ],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    expect(beforeStep).toHaveBeenCalledTimes(1)
    const stepChangedBefore = events.filter(
      (e) => e.type === 'stepChanged',
    ).length

    el.remove()
    registry.unregister('a', el)
    tick(200)

    const replacement = connectedEl()
    registry.register('a', replacement)
    tick()

    expect(events.some((e) => e.type === 'targetRecovered')).toBe(true)
    expect(adapter.calls).toContain('refresh')
    expect(beforeStep).toHaveBeenCalledTimes(1)
    expect(afterStep).not.toHaveBeenCalled()
    expect(events.filter((e) => e.type === 'stepChanged').length).toBe(
      stepChangedBefore,
    )
  }))

  it('re-points at a different element registered under the same name', fakeAsync(() => {
    const el = connectedEl()
    const { adapter, events, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    const replacement = connectedEl()
    registry.register('a', replacement)
    tick()

    // Assert recovery actually ran before checking where it pointed — without
    // this, the test is satisfied by Task 6's resolver closure alone and
    // would pass even with no recovery code at all.
    expect(events.some((e) => e.type === 'targetRecovered')).toBe(true)
    expect(adapter.calls).toContain('refresh')
    expect(adapter.resolveStepElement(0)).toBe(replacement)
  }))

  it('does not treat a target as lost while a selector fallback can still find it', fakeAsync(() => {
    const nav = document.createElement('nav')
    document.body.appendChild(nav)
    const registered = connectedEl()
    const { events, registry, session } = makeSession({
      steps: [{ element: 'nav', popover: { title: 'one' } }],
      targetLostGrace: 500,
    })
    registry.register('nav', registered)

    session.start()
    tick()

    // The registry entry disappears, but "nav" is also a live selector match
    // (the real <nav> element is still connected) — detection must agree
    // with what the popover would actually resolve to, so this must not read
    // as lost.
    registered.remove()
    registry.unregister('nav', registered)
    tick(1000)

    expect(events.some((e) => e.type === 'targetLost')).toBe(false)
  }))

  it('re-arms the newly active step, not a stale one, when a queued recovery re-arm loses the race with a transition', fakeAsync(() => {
    const elA = connectedEl()
    const elB = connectedEl()
    const { events, registry, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' } },
        { element: 'b', popover: { title: 'two' } },
      ],
      targetLostGrace: 1000,
    })
    registry.register('a', elA)
    registry.register('b', elB)

    session.start()
    tick()

    // Step 0 loses its target and enters grace.
    elA.remove()
    registry.unregister('a', elA)

    // In one synchronous block: the app advances past step 0, and step 0's
    // target reappears. This races the transition's `_disarmRecovery()`
    // (which arms step 1) against the queued microtask re-arm from step 0's
    // 'recovered' branch — the re-arm must lose.
    session.next()
    const replacementA = connectedEl()
    registry.register('a', replacementA)

    tick()
    events.splice(0)

    // Step 0's target disappears again. A correctly-scoped recovery is no
    // longer watching it, because step 0 is no longer active.
    replacementA.remove()
    registry.unregister('a', replacementA)
    tick()
    expect(events.some((e) => e.type === 'targetLost' && e.index === 0)).toBe(
      false,
    )

    // Step 1's target disappears. The actually active step's recovery must
    // notice.
    elB.remove()
    registry.unregister('b', elB)
    tick()
    expect(events.some((e) => e.type === 'targetLost' && e.index === 1)).toBe(
      true,
    )
  }))

  it('collapses to elementless when grace expires with the default policy', fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()
    const callsBefore = adapter.calls.length

    el.remove()
    registry.unregister('a', el)
    tick(1000)

    expect(adapter.calls.slice(callsBefore)).toContain('refresh')
    expect(adapter.isActive()).toBe(true)
  }))

  it("ends the guide when grace expires and onTargetLost is 'end'", fakeAsync(() => {
    const el = connectedEl()
    const { events, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' }, onTargetLost: 'end' }],
      targetLostGrace: 500,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(500)

    const closed = events.find((e) => e.type === 'closed')
    expect(closed?.type === 'closed' && closed.result.reason).toBe(
      'targetMissing',
    )
  }))

  it("advances when grace expires and onTargetLost is 'skip'", fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' }, onTargetLost: 'skip' },
        { popover: { title: 'two' } },
      ],
      targetLostGrace: 500,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(500)
    tick()

    expect(adapter.calls).toContain('moveTo:1')
  }))

  it('abandons a pending recovery when the user advances', fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' } },
        { popover: { title: 'two' } },
      ],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(200)

    session.next()
    tick()

    const callsAfterNext = adapter.calls.length
    tick(2000)

    expect(adapter.calls).toContain('moveTo:1')
    expect(adapter.calls.length).toBe(callsAfterNext)
  }))

  it('does not arm recovery for an elementless step', fakeAsync(() => {
    const { events, session } = makeSession({
      steps: [{ popover: { title: 'one' } }],
      targetLostGrace: 500,
    })

    session.start()
    tick(1000)

    expect(events.some((e) => e.type === 'targetLost')).toBe(false)
  }))
})
