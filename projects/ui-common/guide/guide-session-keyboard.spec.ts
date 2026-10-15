import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideResult } from './models/guide-event'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { TheSeamFakeGuideContentRenderer } from './testing/fake-guide-content.renderer'
import { TheSeamFakeGuideAdapter } from './testing/fake-guide.adapter'

function makeSession(config: TheSeamGuideConfig) {
  const adapter = new TheSeamFakeGuideAdapter()
  // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
  let ref: TheSeamGuideRef
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry: new TheSeamGuideTargetRegistry(),
    contentRenderer: new TheSeamFakeGuideContentRenderer(),
    popoverDefaults: {},
    getRef: () => ref,
    onClosed: () => {},
  })
  ref = new TheSeamGuideRef(session)
  let result: TheSeamGuideResult | null = null
  session.afterClosed$.subscribe((r) => (result = r))
  return { adapter, session, closed: () => result }
}

const TWO_STEPS: TheSeamGuideConfig = {
  steps: [{ popover: { title: 'one' } }, { popover: { title: 'two' } }],
}

/** Dispatches a keydown, and reports whether it got past `window`'s capture phase. */
function press(target: Element, key: string): { reachedTarget: boolean } {
  let reachedTarget = false
  const onTarget = () => (reachedTarget = true)
  target.addEventListener('keydown', onTarget)
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  )
  target.removeEventListener('keydown', onTarget)
  return { reachedTarget }
}

function append<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  parent: Element = document.body,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  parent.appendChild(el)
  return el
}

function overlayPane(): HTMLElement {
  const pane = append('div')
  pane.className = 'cdk-overlay-pane'
  return pane
}

describe('TheSeamGuideSession keyboard', () => {
  let sessions: TheSeamGuideSession[]

  beforeEach(() => {
    document.body.innerHTML = ''
    sessions = []
  })

  afterEach(() => {
    // A session left open keeps its window listener.
    sessions.forEach((s) => s.close('destroyed'))
  })

  function start(config: TheSeamGuideConfig) {
    const made = makeSession(config)
    sessions.push(made.session)
    made.session.start()
    tick()
    return made
  }

  it('moves with the arrow keys', fakeAsync(() => {
    const { session } = start(TWO_STEPS)

    press(document.body, 'ArrowRight')
    tick()
    expect(session.activeIndex()).toBe(1)

    press(document.body, 'ArrowLeft')
    tick()
    expect(session.activeIndex()).toBe(0)
  }))

  it('leaves arrow keys typed in a field alone', fakeAsync(() => {
    const { session } = start(TWO_STEPS)
    const input = append('input')

    const { reachedTarget } = press(input, 'ArrowRight')
    tick()

    expect(reachedTarget).toBe(true)
    expect(session.activeIndex()).toBe(0)
  }))

  it('leaves keys inside a contenteditable element alone', fakeAsync(() => {
    const { session, closed } = start(TWO_STEPS)
    const editor = append('div')
    editor.setAttribute('contenteditable', 'true')
    const inner = append('span', editor)

    press(inner, 'ArrowRight')
    press(inner, 'Escape')
    tick()

    expect(session.activeIndex()).toBe(0)
    expect(closed()).toBeNull()
  }))

  it('closes on Escape, and keeps it from what is underneath', fakeAsync(() => {
    const { closed } = start(TWO_STEPS)

    const { reachedTarget } = press(document.body, 'Escape')
    tick()

    expect(closed()?.reason).toBe('dismissed')
    expect(reachedTarget).toBe(false)
  }))

  it('keeps Escape from the modal the guide is shown over', fakeAsync(() => {
    const modalButton = append('button', overlayPane())
    const { closed } = start(TWO_STEPS)

    const { reachedTarget } = press(modalButton, 'Escape')
    tick()

    expect(closed()?.reason).toBe('dismissed')
    expect(reachedTarget).toBe(false)
  }))

  it('leaves Escape to a dialog opened during the guide', fakeAsync(() => {
    const { closed } = start(TWO_STEPS)
    const dialogButton = append('button', overlayPane())

    const { reachedTarget } = press(dialogButton, 'Escape')
    tick()

    expect(closed()).toBeNull()
    expect(reachedTarget).toBe(true)
  }))

  it('does not close a non-dismissible guide on Escape, and still keeps it', fakeAsync(() => {
    const { closed } = start({ ...TWO_STEPS, dismissible: false })

    const { reachedTarget } = press(document.body, 'Escape')
    tick()

    expect(closed()).toBeNull()
    expect(reachedTarget).toBe(false)
  }))

  it('ignores Right when the step hides Next', fakeAsync(() => {
    const { session } = start({
      steps: [
        { popover: { title: 'one', showButtons: ['previous', 'close'] } },
        { popover: { title: 'two' } },
      ],
    })

    press(document.body, 'ArrowRight')
    tick()

    expect(session.activeIndex()).toBe(0)
  }))

  it('ignores Left when the step hides Previous', fakeAsync(() => {
    const { session } = start({
      steps: [
        { popover: { title: 'one' } },
        { popover: { title: 'two', showButtons: ['next'] } },
      ],
    })
    press(document.body, 'ArrowRight')
    tick()

    press(document.body, 'ArrowLeft')
    tick()

    expect(session.activeIndex()).toBe(1)
  }))

  it('ignores held-down arrow keys and ones with a modifier', fakeAsync(() => {
    const { session } = start(TWO_STEPS)

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        repeat: true,
        bubbles: true,
      }),
    )
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        bubbles: true,
      }),
    )
    tick()

    expect(session.activeIndex()).toBe(0)
  }))

  it('stops listening once closed', fakeAsync(() => {
    const { session } = start(TWO_STEPS)
    session.close('dismissed')

    const { reachedTarget } = press(document.body, 'Escape')

    expect(reachedTarget).toBe(true)
  }))
})
