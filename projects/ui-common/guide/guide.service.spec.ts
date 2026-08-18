import { fakeAsync, TestBed, tick } from '@angular/core/testing'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideEvent } from './models/guide-event'
import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

describe('TheSeamGuideService', () => {
  let service: TheSeamGuideService
  let adapter: FakeGuideAdapter

  beforeEach(() => {
    adapter = new FakeGuideAdapter()
    TestBed.configureTestingModule({
      providers: [{ provide: THE_SEAM_GUIDE_ADAPTER, useValue: adapter }],
    })
    service = TestBed.inject(TheSeamGuideService)
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
    // dismissible: false with the default onMissingTarget ('skip') also
    // trips the dev-mode warning tested separately below; suppress it here
    // since this test isn't asserting on it.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })
    expect(adapter.startedConfig?.allowUserDismiss).toBe(false)

    warn.mockRestore()
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
    // The first start() below is dismissible: false with the default
    // onMissingTarget ('skip'), which also trips the dev-mode warning tested
    // separately; suppress it here since this test isn't asserting on it.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })

    expect(() =>
      service.start({ steps: [{ popover: { title: 'two' } }] }),
    ).toThrow(TheSeamGuideBusyError)

    warn.mockRestore()
  })

  it('closes a non-dismissible guide programmatically', async () => {
    // dismissible: false with the default onMissingTarget ('skip') also
    // trips the dev-mode warning tested separately below; suppress it here
    // since this test isn't asserting on it.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const ref = service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })
    const closed = firstValueFromAfterClosed(ref)

    ref.close()

    expect((await closed).reason).toBe('dismissed')
    expect(service.activeGuide()).toBeNull()

    warn.mockRestore()
  })

  it('clears the active guide once closed', async () => {
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    ref.close()
    await Promise.resolve()
    expect(service.activeGuide()).toBeNull()
  })

  it('warns in dev mode when a non-dismissible guide would silently skip steps', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
      onMissingTarget: 'skip',
    })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('dismissible: false'),
    )
    warn.mockRestore()
  })

  describe('teardown', () => {
    afterEach(() => jest.restoreAllMocks())

    it('closes the active guide with reason destroyed when the injector is destroyed', async () => {
      const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
      const closed = firstValueFromAfterClosed(ref)

      TestBed.resetTestingModule()

      expect(await closed).toEqual({
        reason: 'destroyed',
        lastIndex: expect.any(Number),
      })
      expect(adapter.calls).toContain('destroy')
    })

    it('closes a non-dismissible active guide when the injector is destroyed', async () => {
      const ref = service.start({
        steps: [{ popover: { title: 'one' } }],
        dismissible: false,
        onMissingTarget: 'end',
      })
      const closed = firstValueFromAfterClosed(ref)

      TestBed.resetTestingModule()

      expect((await closed).reason).toBe('destroyed')
      expect(adapter.calls).toContain('destroy')
    })

    it('does not throw when the injector is destroyed with no active guide', () => {
      expect(service.activeGuide()).toBeNull()
      expect(() => TestBed.resetTestingModule()).not.toThrow()
    })
  })

  describe('the provideTheSeamGuide() provider hop', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    // Every other test in this file passes `popoverDefaults` straight into
    // `TheSeamGuideSession`'s constructor via a hand-built adapter, which
    // never exercises `provideTheSeamGuide` itself. This pins the real chain:
    // `provideTheSeamGuide({ popover }) -> THE_SEAM_GUIDE_POPOVER_DEFAULTS ->
    // TheSeamGuideService._popoverDefaults -> TheSeamGuideSessionDeps.popoverDefaults`.
    // `_popoverDefaults` falls back to `{}` via `{ optional: true } ?? {}` if
    // the token is ever missing, which would make this test the only thing
    // that notices — every mock-adapter-based spec would keep passing while
    // an application's popover chrome silently vanished.
    it('carries a provider-level popover default through to the adapter', fakeAsync(() => {
      const providerAdapter = new FakeGuideAdapter()
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          provideTheSeamGuide({ popover: { title: 'Provider title' } }),
          { provide: THE_SEAM_GUIDE_ADAPTER, useValue: providerAdapter },
        ],
      })

      const svc = TestBed.inject(TheSeamGuideService)
      svc.start({
        // The provider layer decorates a slot; it never creates one (see
        // "Slot presence" in the design spec) — a step with no title key at
        // all, and no session-layer title either, leaves the slot absent
        // regardless of what the provider supplies. `title: {}` is the
        // session layer marking the slot present without supplying its own
        // renderer or text, so nearest-wins falls all the way through to the
        // provider's default.
        popover: { title: {} },
        steps: [{ popover: { description: 'Step description.' } }],
      })
      tick()

      expect(providerAdapter.startedConfig?.steps[0]?.popover?.title).toBe(
        'Provider title',
      )
      expect(
        providerAdapter.startedConfig?.steps[0]?.popover?.description,
      ).toBe('Step description.')
    }))
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
