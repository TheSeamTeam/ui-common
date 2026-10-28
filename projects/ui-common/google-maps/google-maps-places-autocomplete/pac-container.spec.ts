import {
  claimNextPacContainer,
  syncPacContainerWithFullscreen,
} from './pac-container'

function addPacContainer(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'pac-container pac-logo'
  document.body.appendChild(container)
  return container
}

/** Lets the MutationObserver deliver what was added. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function setFullscreenElement(element: Element | null): void {
  Object.defineProperty(document, 'fullscreenElement', {
    value: element,
    configurable: true,
  })
}

describe('claimNextPacContainer', () => {
  afterEach(() => document.body.replaceChildren())

  it('hands containers out in the order they were claimed', async () => {
    const first = jest.fn()
    const second = jest.fn()
    claimNextPacContainer(first)
    claimNextPacContainer(second)

    const a = addPacContainer()
    const b = addPacContainer()
    await flush()

    expect(first).toHaveBeenCalledWith(a)
    expect(second).toHaveBeenCalledWith(b)
  })

  it('ignores elements that are not a pac-container', async () => {
    const onClaimed = jest.fn()
    const withdraw = claimNextPacContainer(onClaimed)

    document.body.appendChild(document.createElement('div'))
    await flush()

    expect(onClaimed).not.toHaveBeenCalled()
    withdraw()
  })

  it('does not hand out a withdrawn claim', async () => {
    const withdrawn = jest.fn()
    const kept = jest.fn()
    const withdraw = claimNextPacContainer(withdrawn)
    claimNextPacContainer(kept)
    withdraw()

    const container = addPacContainer()
    await flush()

    expect(withdrawn).not.toHaveBeenCalled()
    expect(kept).toHaveBeenCalledWith(container)
  })

  it('does not treat a claimed container moved back to body as new', async () => {
    claimNextPacContainer(jest.fn())
    const container = addPacContainer()
    await flush()

    const waiting = jest.fn()
    const withdraw = claimNextPacContainer(waiting)
    const elsewhere = document.createElement('div')
    document.body.appendChild(elsewhere)
    elsewhere.appendChild(container)
    document.body.appendChild(container)
    await flush()

    expect(waiting).not.toHaveBeenCalled()
    withdraw()
  })
})

describe('syncPacContainerWithFullscreen', () => {
  afterEach(() => {
    setFullscreenElement(null)
    document.body.replaceChildren()
  })

  it('moves the list into the fullscreen element holding its input', () => {
    const fullscreen = document.createElement('div')
    const input = document.createElement('input')
    fullscreen.appendChild(input)
    document.body.appendChild(fullscreen)
    const container = addPacContainer()

    setFullscreenElement(fullscreen)
    syncPacContainerWithFullscreen(container, input)

    expect(container.parentElement).toBe(fullscreen)
  })

  it('moves the list back to body when fullscreen ends', () => {
    const fullscreen = document.createElement('div')
    const input = document.createElement('input')
    fullscreen.appendChild(input)
    document.body.appendChild(fullscreen)
    const container = addPacContainer()
    setFullscreenElement(fullscreen)
    syncPacContainerWithFullscreen(container, input)

    setFullscreenElement(null)
    syncPacContainerWithFullscreen(container, input)

    expect(container.parentElement).toBe(document.body)
  })

  it('leaves the list on body when something else is fullscreen', () => {
    const fullscreen = document.createElement('div')
    const input = document.createElement('input')
    document.body.append(fullscreen, input)
    const container = addPacContainer()

    setFullscreenElement(fullscreen)
    syncPacContainerWithFullscreen(container, input)

    expect(container.parentElement).toBe(document.body)
  })
})
