import { TheSeamGuideAdapterPopover } from '../guide-adapter'
import { DriverJsGuideAdapter } from './driver-js-guide.adapter'

describe('DriverJsGuideAdapter', () => {
  let adapter: DriverJsGuideAdapter

  beforeEach(() => {
    adapter = new DriverJsGuideAdapter()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    adapter.destroy()
    jest.useRealTimers()
  })

  const noopCallbacks = {
    onNextRequested: () => {},
    onPreviousRequested: () => {},
    onCloseRequested: () => {},
  }

  it('is inactive before start and active after', () => {
    expect(adapter.isActive()).toBe(false)
    adapter.start(
      { steps: [{ popover: { title: 'one' } }], allowUserDismiss: true },
      noopCallbacks,
    )
    adapter.moveTo(0)
    expect(adapter.isActive()).toBe(true)
  })

  it('is inactive after destroy', () => {
    adapter.start(
      { steps: [{ popover: { title: 'one' } }], allowUserDismiss: true },
      noopCallbacks,
    )
    adapter.moveTo(0)
    adapter.destroy()
    expect(adapter.isActive()).toBe(false)
  })

  it('routes a next click to onNextRequested instead of advancing itself', () => {
    const onNextRequested = jest.fn()
    adapter.start(
      {
        steps: [{ popover: { title: 'one' } }, { popover: { title: 'two' } }],
        allowUserDismiss: true,
      },
      { ...noopCallbacks, onNextRequested },
    )
    adapter.moveTo(0)

    const nextButton = document.querySelector<HTMLElement>(
      '.driver-popover-next-btn',
    )
    expect(nextButton).not.toBeNull()
    nextButton?.click()

    expect(onNextRequested).toHaveBeenCalledTimes(1)
  })

  it('renders an elementless step as a centered popover', () => {
    adapter.start(
      { steps: [{ popover: { title: 'solo' } }], allowUserDismiss: true },
      noopCallbacks,
    )
    adapter.moveTo(0)

    expect(document.querySelector('.driver-popover')).not.toBeNull()
  })

  it('resolves a step element through the resolver function at paint time', () => {
    const el = document.createElement('div')
    el.id = 'late'
    let attached = false

    adapter.start(
      {
        steps: [
          {
            element: () => (attached ? el : undefined),
            popover: { title: 'one' },
          },
        ],
        allowUserDismiss: true,
      },
      noopCallbacks,
    )

    document.body.appendChild(el)
    attached = true
    adapter.moveTo(0)

    expect(document.querySelector('.driver-popover')).not.toBeNull()
  })

  it('re-resolves the step element on refresh rather than repositioning the stale one', () => {
    jest.useFakeTimers()

    const elA = document.createElement('div')
    elA.id = 'a'
    const elB = document.createElement('div')
    elB.id = 'b'
    document.body.appendChild(elA)
    document.body.appendChild(elB)

    let current: HTMLElement = elA
    const resolver = jest.fn(() => current)

    adapter.start(
      {
        steps: [{ element: resolver, popover: { title: 'one' } }],
        allowUserDismiss: true,
      },
      noopCallbacks,
    )
    adapter.moveTo(0)

    // driver.js settles its internal "previous element" bookkeeping only
    // after its highlight animation finishes (a wall-clock check,
    // `Date.now() - start >= 400`ms default), inside a requestAnimationFrame
    // loop. Without advancing past that, the *next* transition's
    // stale-element cleanup looks at unsettled state and fails to remove the
    // class from the truly-previous element. Fake timers (which jsdom's
    // pretendToBeVisual-backed requestAnimationFrame supports) flush this
    // deterministically in zero wall-clock time, rather than relying on a
    // real sleep racing the animation window.
    jest.advanceTimersByTime(500)

    expect(resolver).toHaveBeenCalledTimes(1)
    expect(elA.classList.contains('driver-active-element')).toBe(true)

    current = elB
    adapter.refresh()
    jest.advanceTimersByTime(500)

    expect(resolver.mock.calls.length).toBeGreaterThan(1)
    expect(elB.classList.contains('driver-active-element')).toBe(true)
    expect(elA.classList.contains('driver-active-element')).toBe(false)
  })

  it('leaves the highlight where it was when repositioning around a detached element', () => {
    jest.useFakeTimers()

    const el = document.createElement('div')
    document.body.appendChild(el)
    // What a browser does, which jsdom does not: a real size while attached,
    // and zeros once removed.
    el.getBoundingClientRect = () =>
      el.isConnected ? new DOMRect(200, 150, 80, 40) : new DOMRect(0, 0, 0, 0)

    adapter.start(
      {
        steps: [{ element: () => el, popover: { title: 'one' } }],
        allowUserDismiss: true,
      },
      noopCallbacks,
    )
    adapter.moveTo(0)
    jest.advanceTimersByTime(500)

    const cutout = () =>
      document.querySelector('.driver-overlay path')?.getAttribute('d')
    const before = cutout()
    expect(before).toContain('M')

    el.remove()
    adapter.reposition()
    jest.advanceTimersByTime(100)

    expect(cutout()).toBe(before)
  })

  describe('holding position', () => {
    /** Attached, with a browser's measurements: real while attached, zeros once removed. */
    function measuredEl(x: number, y: number): HTMLElement {
      const el = document.createElement('div')
      document.body.appendChild(el)
      el.getBoundingClientRect = () =>
        el.isConnected ? new DOMRect(x, y, 80, 40) : new DOMRect(0, 0, 0, 0)
      return el
    }

    const cutout = () =>
      document.querySelector('.driver-overlay path')?.getAttribute('d')

    it('keeps the highlight in place when the target leaves before it has settled', () => {
      jest.useFakeTimers()
      const el = measuredEl(200, 150)
      adapter.start(
        {
          steps: [{ element: () => el, popover: { title: 'one' } }],
          allowUserDismiss: true,
        },
        noopCallbacks,
      )
      adapter.moveTo(0)
      // Inside driver.js's 400ms highlight animation, which measures the
      // target on every frame.
      jest.advanceTimersByTime(200)
      const before = cutout()

      el.remove()
      adapter.holdPosition()
      jest.advanceTimersByTime(500)
      adapter.reposition()
      jest.advanceTimersByTime(100)

      expect(cutout()).toBe(before)
    })

    it('stops holding once the step is drawn again', () => {
      jest.useFakeTimers()
      const first = measuredEl(200, 150)
      let current = first
      adapter.start(
        {
          steps: [{ element: () => current, popover: { title: 'one' } }],
          allowUserDismiss: true,
        },
        noopCallbacks,
      )
      adapter.moveTo(0)
      jest.advanceTimersByTime(500)

      first.remove()
      adapter.holdPosition()
      current = measuredEl(300, 250)
      adapter.refresh()
      jest.advanceTimersByTime(500)

      // The removed element measures as itself again.
      expect(first.getBoundingClientRect().width).toBe(0)
      expect(cutout()).not.toContain('M195,140')
      expect(cutout()).toContain('M295,240')
    })
  })
})

describe('DriverJsGuideAdapter popover slots', () => {
  let adapter: DriverJsGuideAdapter

  beforeEach(() => {
    document.body.innerHTML = ''
    adapter = new DriverJsGuideAdapter()
  })

  afterEach(() => {
    adapter.destroy()
    jest.restoreAllMocks()
  })

  function drive(popover: TheSeamGuideAdapterPopover): void {
    const el = document.createElement('div')
    document.body.appendChild(el)
    adapter.start(
      { steps: [{ element: () => el, popover }], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )
    adapter.moveTo(0)
  }

  function slot(name: 'title' | 'description'): HTMLElement {
    const el = document.querySelector<HTMLElement>(`.driver-popover-${name}`)
    expect(el).toBeTruthy()
    return el as HTMLElement
  }

  it('renders a string title and description', () => {
    drive({ title: 'a title', description: 'a description' })
    expect(slot('title').textContent).toBe('a title')
    expect(slot('description').textContent).toBe('a description')
  })

  it('places an element description and makes it visible', () => {
    const host = document.createElement('div')
    host.textContent = 'from a view'
    drive({ description: host })

    // The visibility half is the regression: driver.js hides a slot whose
    // string is falsy, so populating it is not enough on its own.
    expect(slot('description').contains(host)).toBe(true)
    expect(slot('description').style.display).toBe('block')
  })

  it('places an element title and makes it visible', () => {
    const host = document.createElement('div')
    host.textContent = 'a view title'
    drive({ title: host })

    expect(slot('title').contains(host)).toBe(true)
    expect(slot('title').style.display).toBe('block')
  })

  it('fills both slots with elements at once', () => {
    const titleHost = document.createElement('div')
    titleHost.textContent = 'view title'
    const descHost = document.createElement('div')
    descHost.textContent = 'view description'
    drive({ title: titleHost, description: descHost })

    expect(slot('title').contains(titleHost)).toBe(true)
    expect(slot('description').contains(descHost)).toBe(true)
  })

  it('re-adopts the same host node when the step is re-driven', () => {
    const host = document.createElement('div')
    host.textContent = 'from a view'
    drive({ description: host })

    // driver.js rebuilds its whole popover on every render, so refresh()
    // orphans the host and the hook must take it back. This is what lets a
    // view survive mid-step recovery instead of being re-created.
    adapter.refresh()

    expect(slot('description').contains(host)).toBe(true)
    expect(slot('description').style.display).toBe('block')
  })

  it('carries side and align through to the driven config', () => {
    drive({ description: 'text', side: 'right', align: 'end' })

    // jsdom recomputes driver.js's actual on-screen placement from layout
    // geometry that jsdom does not lay out, so a rendered-class or position
    // assertion here would pass regardless of whether `side`/`align` ever
    // reached driver.js. Reading them back off driver.js's own config is the
    // one check that still fails if `_toDrivePopover` stops carrying them —
    // deleting `side`/`align` from its return literal used to leave this
    // test green, because the old assertion only checked that *a* popover
    // rendered at all, not that these two fields reached it.
    const config = (
      adapter as unknown as {
        _driver: {
          getConfig(): {
            steps: { popover?: { side?: string; align?: string } }[]
          }
        }
      }
    )._driver.getConfig()

    expect(config.steps[0]?.popover?.side).toBe('right')
    expect(config.steps[0]?.popover?.align).toBe('end')
  })

  function visible(selector: string): boolean {
    const el = document.querySelector<HTMLElement>(selector)
    return el !== null && el.style.display !== 'none'
  }

  it('renders button labels and progress text', () => {
    drive({
      description: 'text',
      doneButtonText: 'Finish',
      previousButtonText: 'Back',
      showProgress: true,
      progressText: 'Step {{current}}/{{total}}',
    })

    // A one-step guide: its Next button is the Done button.
    expect(
      document.querySelector('.driver-popover-next-btn')?.textContent,
    ).toBe('Finish')
    expect(
      document.querySelector('.driver-popover-prev-btn')?.textContent,
    ).toBe('Back')
    expect(
      document.querySelector('.driver-popover-progress-text')?.textContent,
    ).toBe('Step 1/1')
  })

  it('keeps "Done" on the last step when every step sets a Next label', () => {
    const popover = { description: 'text', nextButtonText: 'Onward' }
    adapter.start(
      { steps: [{ popover }, { popover }], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )
    const nextLabel = () =>
      document.querySelector('.driver-popover-next-btn')?.textContent

    adapter.moveTo(0)
    expect(nextLabel()).toBe('Onward')

    adapter.moveTo(1)
    expect(nextLabel()).toBe('Done')
  })

  it('shows only the listed buttons', () => {
    drive({ description: 'text', showButtons: ['previous'] })

    expect(visible('.driver-popover-next-btn')).toBe(false)
    expect(visible('.driver-popover-prev-btn')).toBe(true)
    expect(visible('.driver-popover-close-btn')).toBe(false)
  })

  it('shows no buttons for an empty list', () => {
    drive({ description: 'text', showButtons: [] })

    expect(visible('.driver-popover-close-btn')).toBe(false)
    expect(visible('.driver-popover-footer')).toBe(false)
  })

  it('leaves keys to the session', () => {
    const onCloseRequested = jest.fn()
    const onNextRequested = jest.fn()
    adapter.start(
      {
        steps: [{ popover: { title: 'one' } }, { popover: { title: 'two' } }],
        allowUserDismiss: true,
      },
      { onCloseRequested, onNextRequested, onPreviousRequested: () => {} },
    )
    adapter.moveTo(0)

    for (const key of ['Escape', 'ArrowRight']) {
      window.dispatchEvent(new KeyboardEvent('keyup', { key }))
    }

    expect(onCloseRequested).not.toHaveBeenCalled()
    expect(onNextRequested).not.toHaveBeenCalled()
  })
})
