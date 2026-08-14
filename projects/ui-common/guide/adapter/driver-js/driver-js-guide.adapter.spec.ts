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
})
