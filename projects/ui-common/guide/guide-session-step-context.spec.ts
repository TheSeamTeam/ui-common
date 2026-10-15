import { fakeAsync, flush, tick } from '@angular/core/testing'

import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import {
  TheSeamGuideAfterStepContext,
  TheSeamGuideBeforeStepContext,
} from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { TheSeamFakeGuideContentRenderer } from './testing/fake-guide-content.renderer'
import { TheSeamFakeGuideAdapter } from './testing/fake-guide.adapter'

function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function makeSession(config: TheSeamGuideConfig) {
  const adapter = new TheSeamFakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
  let ref: TheSeamGuideRef
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    contentRenderer: new TheSeamFakeGuideContentRenderer(),
    popoverDefaults: {},
    getRef: () => ref,
    onClosed: () => {},
  })
  ref = new TheSeamGuideRef(session)
  return { adapter, registry, session, ref }
}

/** A `beforeStep` that hands its context to the test. */
function captureBefore() {
  const contexts: TheSeamGuideBeforeStepContext[] = []
  return {
    contexts,
    hook: (context: TheSeamGuideBeforeStepContext) =>
      void contexts.push(context),
  }
}

async function settle(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve()
  }
}

describe('TheSeamGuideSession step context', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('tells beforeStep which step it runs for', fakeAsync(() => {
    const before = captureBefore()
    const { session, ref } = makeSession({
      steps: [{ popover: { title: 'one' } }, { beforeStep: before.hook }],
    })
    session.start()
    tick()
    session.next()
    tick()

    expect(before.contexts).toHaveLength(1)
    expect(before.contexts[0]).toEqual(
      expect.objectContaining({ index: 1, step: session.steps[1], guide: ref }),
    )
    session.close('destroyed')
  }))

  describe('exit$', () => {
    function exits(
      config: TheSeamGuideConfig,
      contexts: TheSeamGuideBeforeStepContext[],
    ) {
      let count = 0
      const made = makeSession(config)
      made.session.start()
      tick()
      contexts[0]?.exit$.subscribe(() => count++)
      return { ...made, count: () => count }
    }

    it('emits when the guide moves to another step', fakeAsync(() => {
      const before = captureBefore()
      const { session, count } = exits(
        { steps: [{ beforeStep: before.hook }, {}] },
        before.contexts,
      )
      expect(count()).toBe(0)

      session.next()
      tick()

      expect(count()).toBe(1)
      session.close('destroyed')
    }))

    it('emits when the guide closes', fakeAsync(() => {
      const before = captureBefore()
      const { session, count } = exits(
        { steps: [{ beforeStep: before.hook }] },
        before.contexts,
      )

      session.close('dismissed')

      expect(count()).toBe(1)
    }))

    it('emits when its step is skipped', fakeAsync(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      const before = captureBefore()
      const { session, count } = exits(
        {
          steps: [
            { element: 'never', beforeStep: before.hook, targetTimeout: 50 },
            {},
          ],
        },
        before.contexts,
      )

      tick(50)

      expect(count()).toBe(1)
      expect(session.activeIndex()).toBe(1)
      session.close('destroyed')
    }))

    it('reaches a subscriber that arrives after it fired', fakeAsync(() => {
      const before = captureBefore()
      const { session } = makeSession({ steps: [{ beforeStep: before.hook }] })
      session.start()
      tick()
      session.close('dismissed')

      let heard = false
      before.contexts[0].exit$.subscribe(() => (heard = true))

      expect(heard).toBe(true)
    }))

    it('does not fire when the same step is requested again while it is entering', fakeAsync(() => {
      const before = captureBefore()
      const { registry, session } = makeSession({
        steps: [{ element: 'late', beforeStep: before.hook }],
        targetTimeout: 5000,
      })
      session.start()
      tick()
      let count = 0
      before.contexts[0].exit$.subscribe(() => count++)

      session.moveTo(0)
      tick()
      registry.register('late', connectedEl())
      tick()

      expect(count).toBe(0)
      expect(session.activeIndex()).toBe(0)
      session.close('destroyed')
    }))
  })

  describe('advanceWhenTarget', () => {
    it("moves on when the target appears, with 'appears'", fakeAsync(() => {
      const { registry, session } = makeSession({
        steps: [
          {
            beforeStep: ({ advanceWhenTarget }) =>
              advanceWhenTarget('dialog', 'appears'),
          },
          {},
        ],
      })
      session.start()
      tick()
      expect(session.activeIndex()).toBe(0)

      registry.register('dialog', connectedEl())
      tick()

      expect(session.activeIndex()).toBe(1)
      session.close('destroyed')
    }))

    it("moves on when the target goes away, with 'disappears'", fakeAsync(() => {
      const { registry, session } = makeSession({
        steps: [
          {
            element: 'dialog',
            beforeStep: ({ advanceWhenTarget }) =>
              advanceWhenTarget('dialog', 'disappears'),
          },
          {},
        ],
      })
      const dialog = connectedEl()
      registry.register('dialog', dialog)
      session.start()
      tick()
      expect(session.activeIndex()).toBe(0)

      registry.unregister('dialog', dialog)
      tick()

      expect(session.activeIndex()).toBe(1)
      session.close('destroyed')
    }))

    it('waits for a change, rather than acting on how things already are', fakeAsync(() => {
      const { registry, session } = makeSession({
        steps: [
          {
            beforeStep: ({ advanceWhenTarget }) =>
              advanceWhenTarget('dialog', 'appears'),
          },
          {},
        ],
      })
      registry.register('dialog', connectedEl())
      session.start()
      tick()

      expect(session.activeIndex()).toBe(0)
      session.close('destroyed')
    }))

    it('stops once its step is left', fakeAsync(() => {
      const { registry, session } = makeSession({
        steps: [
          {
            beforeStep: ({ advanceWhenTarget }) =>
              advanceWhenTarget('dialog', 'appears'),
          },
          {},
          {},
        ],
      })
      session.start()
      tick()
      session.next()
      tick()

      registry.register('dialog', connectedEl())
      tick()

      expect(session.activeIndex()).toBe(1)
      session.close('destroyed')
    }))

    it('watches a selector too', async () => {
      const { session } = makeSession({
        steps: [
          {
            beforeStep: ({ advanceWhenTarget }) =>
              advanceWhenTarget('.dialog', 'appears'),
          },
          {},
        ],
      })
      session.start()
      await settle()
      expect(session.activeIndex()).toBe(0)

      connectedEl().className = 'dialog'
      await settle()

      expect(session.activeIndex()).toBe(1)
      session.close('destroyed')
    })
  })

  describe('afterStep', () => {
    function captureAfter() {
      const contexts: TheSeamGuideAfterStepContext[] = []
      return {
        contexts,
        hook: (context: TheSeamGuideAfterStepContext) =>
          void contexts.push(context),
      }
    }

    it('is told no close reason when the guide moves on', fakeAsync(() => {
      const after = captureAfter()
      const { session } = makeSession({
        steps: [{ afterStep: after.hook }, {}],
      })
      session.start()
      tick()
      session.next()
      tick()

      expect(after.contexts[0]).toEqual(
        expect.objectContaining({ index: 0, closeReason: null }),
      )
      session.close('destroyed')
    }))

    it('is told why the guide closed', fakeAsync(() => {
      const after = captureAfter()
      const { session } = makeSession({ steps: [{ afterStep: after.hook }] })
      session.start()
      tick()

      session.close('superseded')

      expect(after.contexts[0]).toEqual(
        expect.objectContaining({ index: 0, closeReason: 'superseded' }),
      )
    }))

    it("is told 'completed' after the last step", fakeAsync(() => {
      const after = captureAfter()
      const { session } = makeSession({ steps: [{ afterStep: after.hook }] })
      session.start()
      tick()

      session.next()
      tick()

      expect(after.contexts[0]?.closeReason).toBe('completed')
    }))
  })
})

describe('TheSeamGuideSession following its target', () => {
  let observers: FakeResizeObserver[]

  class FakeResizeObserver {
    observed: Element[] = []
    disconnected = false
    constructor(readonly callback: () => void) {
      observers.push(this)
    }
    observe(el: Element) {
      this.observed.push(el)
    }
    disconnect() {
      this.disconnected = true
    }
    /** What a real one does: report once on observe, then on each change. */
    report() {
      this.callback()
    }
  }

  beforeEach(() => {
    document.body.innerHTML = ''
    observers = []
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver =
      FakeResizeObserver
  })

  afterEach(() => {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver
  })

  it('repositions when the target changes size, but not for the first report', fakeAsync(() => {
    const target = connectedEl()
    const { adapter, session } = makeSession({
      steps: [{ element: target }],
    })
    session.start()
    tick()
    expect(observers[0]?.observed).toEqual([target])

    observers[0].report()
    expect(adapter.calls).not.toContain('reposition')

    observers[0].report()
    expect(adapter.calls).toContain('reposition')
    session.close('destroyed')
  }))

  it('stops following when the step is left, and follows the next target', fakeAsync(() => {
    const first = connectedEl()
    const second = connectedEl()
    const { session } = makeSession({
      steps: [{ element: first }, { element: second }],
    })
    session.start()
    tick()

    session.next()
    tick()

    expect(observers[0].disconnected).toBe(true)
    expect(observers[observers.length - 1].observed).toEqual([second])
    session.close('destroyed')
  }))

  it('stops following when the guide closes', fakeAsync(() => {
    const { session } = makeSession({ steps: [{ element: connectedEl() }] })
    session.start()
    tick()

    session.close('dismissed')

    expect(observers[0].disconnected).toBe(true)
  }))
})

describe('TheSeamGuideSession waiting for animations', () => {
  let animations: Animation[]

  beforeEach(() => {
    document.body.innerHTML = ''
    animations = []
    ;(document as { getAnimations?: () => Animation[] }).getAnimations = () =>
      animations
  })

  afterEach(() => {
    delete (document as { getAnimations?: unknown }).getAnimations
  })

  function fakeAnimation(
    target: Element,
    endTime: number,
  ): { animation: Animation; finish: () => void } {
    let finish = () => {}
    const finished = new Promise<Animation>((resolve) => {
      finish = () => resolve(animation)
    })
    const animation = {
      playState: 'running',
      finished,
      effect: { target, getComputedTiming: () => ({ endTime }) },
    } as unknown as Animation
    return { animation, finish }
  }

  it('paints once an animation on an element containing the target ends', fakeAsync(() => {
    const dialog = connectedEl()
    const target = document.createElement('button')
    dialog.appendChild(target)
    const opening = fakeAnimation(dialog, 225)
    animations.push(opening.animation)
    const { adapter, session } = makeSession({ steps: [{ element: target }] })

    session.start()
    tick(50)
    expect(adapter.calls).not.toContain('moveTo:0')

    opening.finish()
    tick(50)
    expect(adapter.calls).toContain('moveTo:0')
    session.close('destroyed')
  }))

  it('does not wait for an animation that never ends', fakeAsync(() => {
    const target = connectedEl()
    animations.push(fakeAnimation(target, Infinity).animation)
    const { adapter, session } = makeSession({ steps: [{ element: target }] })

    session.start()
    tick(50)

    expect(adapter.calls).toContain('moveTo:0')
    session.close('destroyed')
  }))

  it('does not wait for an animation inside the target', fakeAsync(() => {
    const target = connectedEl()
    const child = document.createElement('span')
    target.appendChild(child)
    animations.push(fakeAnimation(child, 500).animation)
    const { adapter, session } = makeSession({ steps: [{ element: target }] })

    session.start()
    tick(50)

    expect(adapter.calls).toContain('moveTo:0')
    session.close('destroyed')
  }))

  it('stops waiting after targetTimeout', fakeAsync(() => {
    const target = connectedEl()
    animations.push(fakeAnimation(target, 10_000).animation)
    const { adapter, session } = makeSession({
      steps: [{ element: target, targetTimeout: 300 }],
    })

    session.start()
    tick(100)
    expect(adapter.calls).not.toContain('moveTo:0')

    tick(300)
    expect(adapter.calls).toContain('moveTo:0')
    session.close('destroyed')
    flush()
  }))
})
