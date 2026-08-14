import { DriverJsGuideAdapter } from './driver-js-guide.adapter'

describe('DriverJsGuideAdapter', () => {
  let adapter: DriverJsGuideAdapter

  beforeEach(() => {
    adapter = new DriverJsGuideAdapter()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    adapter.destroy()
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
})
