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

  it('keeps side and align on the drive step', () => {
    drive({ description: 'text', side: 'right', align: 'end' })
    expect(document.querySelector('.driver-popover')).toBeTruthy()
  })
})
