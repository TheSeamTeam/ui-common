import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideTargetTimeoutError } from '../models/guide-errors'
import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/** Creates an element attached to the document so `isConnected` is true. */
function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('TheSeamGuideTargetRegistry', () => {
  let registry: TheSeamGuideTargetRegistry

  beforeEach(() => {
    registry = new TheSeamGuideTargetRegistry()
    document.body.innerHTML = ''
  })

  it('resolves a registered, connected element', () => {
    const el = connectedEl()
    registry.register('a', el)
    expect(registry.resolve('a')).toBe(el)
  })

  it('returns null for an unknown name', () => {
    expect(registry.resolve('nope')).toBeNull()
  })

  it('ignores elements that are no longer connected to the document', () => {
    const el = document.createElement('div')
    registry.register('a', el)
    expect(registry.resolve('a')).toBeNull()
  })

  it('returns the most recently registered connected element for duplicates', () => {
    const first = connectedEl()
    const second = connectedEl()
    registry.register('a', first)
    registry.register('a', second)
    expect(registry.resolve('a')).toBe(second)
  })

  it('resolves the remaining element after one of a duplicate pair unregisters', () => {
    const first = connectedEl()
    const second = connectedEl()
    registry.register('a', first)
    registry.register('a', second)
    registry.unregister('a', second)
    expect(registry.resolve('a')).toBe(first)
  })

  it('waitFor emits immediately when already registered', fakeAsync(() => {
    const el = connectedEl()
    registry.register('a', el)

    let resolved: Element | null = null
    registry.waitFor('a', 1000).subscribe((e) => (resolved = e))
    tick()

    expect(resolved).toBe(el)
  }))

  it('waitFor emits when the element registers later', fakeAsync(() => {
    let resolved: Element | null = null
    registry.waitFor('a', 1000).subscribe((e) => (resolved = e))
    tick(500)
    expect(resolved).toBeNull()

    const el = connectedEl()
    registry.register('a', el)
    tick()

    expect(resolved).toBe(el)
  }))

  it('waitFor errors with TheSeamGuideTargetTimeoutError on timeout', fakeAsync(() => {
    let error: unknown = null
    registry.waitFor('a', 1000).subscribe({ error: (e) => (error = e) })
    tick(1000)

    expect(error).toBeInstanceOf(TheSeamGuideTargetTimeoutError)
    expect((error as TheSeamGuideTargetTimeoutError).targetName).toBe('a')
  }))

  it('re-registration after destroy resolves again', fakeAsync(() => {
    const first = connectedEl()
    registry.register('a', first)
    registry.unregister('a', first)
    expect(registry.resolve('a')).toBeNull()

    const second = connectedEl()
    registry.register('a', second)
    expect(registry.resolve('a')).toBe(second)
  }))
})
