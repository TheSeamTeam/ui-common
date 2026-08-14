import { TestBed } from '@angular/core/testing'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideEvent } from './models/guide-event'
import { TheSeamGuideService } from './guide.service'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

describe('TheSeamGuideService', () => {
  let service: TheSeamGuideService
  let adapter: FakeGuideAdapter
  let warn: jest.SpyInstance

  beforeEach(() => {
    adapter = new FakeGuideAdapter()
    TestBed.configureTestingModule({
      providers: [{ provide: THE_SEAM_GUIDE_ADAPTER, useValue: adapter }],
    })
    service = TestBed.inject(TheSeamGuideService)
    // Several tests below start a `dismissible: false` guide without
    // overriding `onMissingTarget`, which defaults to 'skip' and so trips the
    // service's dev-mode warning as a side effect. Suppress it here so only
    // the test that specifically exercises the warning asserts on it.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('has no active guide before start', () => {
    expect(service.activeGuide()).toBeNull()
  })

  it('exposes the ref as the active guide after start', () => {
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    expect(service.activeGuide()).toBe(ref)
  })

  it('emits a started event', async () => {
    const events: TheSeamGuideEvent[] = []
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    ref.events$.subscribe((e) => events.push(e))
    await Promise.resolve()

    expect(events.some((e) => e.type === 'started')).toBe(true)
  })

  it('starts the adapter with allowUserDismiss true by default', () => {
    service.start({ steps: [{ popover: { title: 'one' } }] })
    expect(adapter.startedConfig?.allowUserDismiss).toBe(true)
  })

  it('starts the adapter with allowUserDismiss false when not dismissible', () => {
    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })
    expect(adapter.startedConfig?.allowUserDismiss).toBe(false)
  })

  it('supersedes a dismissible active guide', async () => {
    const first = service.start({ steps: [{ popover: { title: 'one' } }] })
    const closed = firstValueFromAfterClosed(first)

    const second = service.start({ steps: [{ popover: { title: 'two' } }] })

    expect(await closed).toEqual({
      reason: 'superseded',
      lastIndex: expect.any(Number),
    })
    expect(service.activeGuide()).toBe(second)
  })

  it('throws TheSeamGuideBusyError rather than superseding a non-dismissible guide', () => {
    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })

    expect(() =>
      service.start({ steps: [{ popover: { title: 'two' } }] }),
    ).toThrow(TheSeamGuideBusyError)
  })

  it('closes a non-dismissible guide programmatically', async () => {
    const ref = service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })
    const closed = firstValueFromAfterClosed(ref)

    ref.close()

    expect((await closed).reason).toBe('dismissed')
    expect(service.activeGuide()).toBeNull()
  })

  it('clears the active guide once closed', async () => {
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    ref.close()
    await Promise.resolve()
    expect(service.activeGuide()).toBeNull()
  })

  it('warns in dev mode when a non-dismissible guide would silently skip steps', () => {
    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
      onMissingTarget: 'skip',
    })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('dismissible: false'),
    )
  })
})

function firstValueFromAfterClosed(ref: {
  afterClosed$: {
    subscribe: (
      next: (r: { reason: string; lastIndex: number }) => void,
    ) => void
  }
}) {
  return new Promise<{ reason: string; lastIndex: number }>((resolve) => {
    ref.afterClosed$.subscribe((r: { reason: string; lastIndex: number }) =>
      resolve(r),
    )
  })
}
