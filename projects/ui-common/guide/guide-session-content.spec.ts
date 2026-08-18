import { TemplateRef } from '@angular/core'
import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import {
  TheSeamGuideContentContext,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
} from './models/guide-content'
import { TheSeamGuidePopover } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideContentRenderer } from './testing/fake-guide-content.renderer'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function makeSession(
  config: TheSeamGuideConfig,
  popoverDefaults: TheSeamGuidePopover = {},
) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const contentRenderer = new FakeGuideContentRenderer()
  // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
  let ref: TheSeamGuideRef
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    contentRenderer,
    popoverDefaults,
    getRef: () => ref,
    onClosed: () => {},
  })
  ref = new TheSeamGuideRef(session)
  return { adapter, session, contentRenderer, ref }
}

function popoverAt(adapter: FakeGuideAdapter, index: number) {
  return adapter.startedConfig?.steps[index]?.popover
}

describe('TheSeamGuideSession popover layers', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses the session layer when the step omits a slot', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { description: 'Step one.' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBe('Guide title')
    expect(popoverAt(adapter, 0)?.description).toBe('Step one.')
    session.close('destroyed')
  }))

  it('lets the step override the session layer', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { title: 'Step title' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBe('Step title')
    session.close('destroyed')
  }))

  it('lets the step clear a session-supplied slot with null', fakeAsync(() => {
    const { adapter, session } = makeSession({
      popover: { title: 'Guide title' },
      steps: [{ popover: { title: null, description: 'Step one.' } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBeUndefined()
    expect(popoverAt(adapter, 0)?.description).toBe('Step one.')
    session.close('destroyed')
  }))

  it('does not let the provider layer create a slot', fakeAsync(() => {
    const { adapter, session } = makeSession(
      { steps: [{ popover: { description: 'Step one.' } }] },
      { title: 'Provider title' },
    )
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBeUndefined()
    session.close('destroyed')
  }))

  it('layers side and align nearest-wins', fakeAsync(() => {
    const { adapter, session } = makeSession(
      {
        popover: { side: 'bottom' },
        steps: [
          { popover: { description: 'One.' } },
          { popover: { description: 'Two.', side: 'left', align: 'end' } },
        ],
      },
      { side: 'top', align: 'center' },
    )
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.side).toBe('bottom')
    expect(popoverAt(adapter, 0)?.align).toBe('center')
    expect(popoverAt(adapter, 1)?.side).toBe('left')
    expect(popoverAt(adapter, 1)?.align).toBe('end')
    session.close('destroyed')
  }))

  it('omits the popover entirely when no layer supplies anything', fakeAsync(() => {
    const { adapter, session } = makeSession({ steps: [{}] })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)).toBeUndefined()
    session.close('destroyed')
  }))
})

class TitleComponent {}

describe('TheSeamGuideSession popover views', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('hands the adapter a host element for a component slot', fakeAsync(() => {
    const { adapter, session } = makeSession({
      steps: [{ popover: { title: { component: TitleComponent } } }],
    })
    session.start()
    tick()

    expect(popoverAt(adapter, 0)?.title).toBeInstanceOf(HTMLElement)
    session.close('destroyed')
  }))

  it('renders a slot on entry with the merged context', fakeAsync(() => {
    const { session, contentRenderer, ref } = makeSession(
      {
        steps: [
          {
            popover: {
              title: 'Step One',
              description: 'One.',
            },
          },
        ],
      },
      { title: { component: TitleComponent, data: { icon: 'app' } } },
    )
    session.start()
    tick()

    expect(contentRenderer.renders).toHaveLength(1)
    const [render] = contentRenderer.renders
    expect(render.slot).toMatchObject({
      kind: 'component',
      component: TitleComponent,
    })
    expect(render.context.data).toEqual({ icon: 'app' })
    expect(render.context.text).toBe('Step One')
    expect(render.context.index).toBe(0)
    expect(render.context.total).toBe(1)
    // Identity, not equality: this is the forward-reference hazard `getRef`
    // exists to cross — `ref` is only constructed after the session, so a
    // wrong closure (e.g. one that closes over a different session's ref)
    // would slip past every other assertion in this file.
    expect(render.context.guide).toBe(ref)
    session.close('destroyed')
  }))

  it('does not render a slot before its step is entered', fakeAsync(() => {
    const { session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
        { popover: { title: { component: TitleComponent, text: 'Two' } } },
      ],
    })
    session.start()
    tick()

    expect(contentRenderer.renders).toHaveLength(1)
    expect(contentRenderer.renders[0].context.index).toBe(0)
    session.close('destroyed')
  }))

  it('destroys the outgoing view and renders the incoming one', fakeAsync(() => {
    const { session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
        { popover: { title: { component: TitleComponent, text: 'Two' } } },
      ],
    })
    session.start()
    tick()
    session.next()
    tick()

    expect(contentRenderer.renders).toHaveLength(2)
    expect(contentRenderer.renders[0].destroyed).toBe(true)
    expect(contentRenderer.live).toHaveLength(1)
    expect(contentRenderer.live[0].context.index).toBe(1)
    session.close('destroyed')
  }))

  it('does not destroy the current view when repainting the same index', fakeAsync(() => {
    const { session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
      ],
    })
    session.start()
    tick()
    // `moveTo` the already-active index: `_paint`'s `outgoing === index` must
    // skip `_destroySlots`, and `_renderSlots` must be a no-op for a slot that
    // already has a live view — otherwise a repaint at the live index would
    // silently empty the popover for the rest of the step.
    session.moveTo(0)
    tick()

    expect(contentRenderer.renders).toHaveLength(1)
    expect(contentRenderer.live).toHaveLength(1)
    session.close('destroyed')
  }))

  it('does not re-create the view on refresh', fakeAsync(() => {
    const { session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
      ],
    })
    session.start()
    tick()
    session.refresh()
    tick()

    // Mid-step recovery must preserve content state. The host node is stable
    // and the adapter re-adopts it, so nothing is rebuilt here.
    expect(contentRenderer.renders).toHaveLength(1)
    expect(contentRenderer.renders[0].destroyed).toBe(false)
    session.close('destroyed')
  }))

  it('reuses the same host node across a refresh', fakeAsync(() => {
    const { adapter, session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
      ],
    })
    session.start()
    tick()
    session.refresh()
    tick()

    // `FakeGuideAdapter.refresh()` is a no-op and never rewrites
    // `startedConfig`, so this read is equal to `contentRenderer.renders[0].host`
    // whether or not a real engine would have re-adopted it — this fake
    // cannot exercise re-adoption across a refresh at all. What this
    // assertion actually pins is one layer down: that the session hands the
    // adapter the *same* host reference on every render, not a fresh one.
    // Re-adoption against a real engine is covered separately, against real
    // driver.js, by `driver-js-guide.adapter.spec.ts`'s
    // `'re-adopts the same host node when the step is re-driven'`.
    const hostAfterRefresh = popoverAt(adapter, 0)?.title
    expect(contentRenderer.renders[0].host).toBe(hostAfterRefresh)
    session.close('destroyed')
  }))

  it('destroys live views when the guide closes', fakeAsync(() => {
    const { session, contentRenderer } = makeSession({
      steps: [
        { popover: { title: { component: TitleComponent, text: 'One' } } },
      ],
    })
    session.start()
    tick()
    session.close('dismissed')
    tick()

    expect(contentRenderer.live).toHaveLength(0)
  }))

  it('renders a template slot', fakeAsync(() => {
    const template = {} as TemplateRef<TheSeamGuideContentContext>
    const { session, contentRenderer } = makeSession({
      steps: [{ popover: { description: { template, text: 'One' } } }],
    })
    session.start()
    tick()

    expect(contentRenderer.renders[0].slot).toMatchObject({
      kind: 'template',
      template,
    })
    session.close('destroyed')
  }))
})

/**
 * Wraps `FakeGuideContentRenderer` to call `close()` on the guide from
 * inside `render()` itself — reproducing a content component that is given
 * `TheSeamGuideRef` on its element injector and calls `ref.close()` from its
 * own constructor, which runs synchronously inside `_renderSlots`.
 */
class CloseDuringRenderContentRenderer extends FakeGuideContentRenderer {
  override render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView {
    const view = super.render(slot, context, host)
    context.guide.close('dismissed')
    return view
  }
}

describe('TheSeamGuideSession re-entrant close during render', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('destroys the just-rendered view and never arms recovery when a slot calls close() from its own render', fakeAsync(() => {
    const registry = new TheSeamGuideTargetRegistry()
    const target = document.createElement('div')
    document.body.appendChild(target)
    registry.register('one', target)

    const adapter = new FakeGuideAdapter()
    const contentRenderer = new CloseDuringRenderContentRenderer()
    // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
    let ref: TheSeamGuideRef
    const session = new TheSeamGuideSession(
      {
        steps: [
          { element: 'one', popover: { title: { component: TitleComponent } } },
        ],
      },
      {
        adapter,
        registry,
        contentRenderer,
        popoverDefaults: {},
        getRef: () => ref,
        onClosed: () => {},
      },
    )
    ref = new TheSeamGuideRef(session)

    session.start()
    tick()

    // The view created during the re-entrant close must not be left attached.
    expect(contentRenderer.renders).toHaveLength(1)
    expect(contentRenderer.renders[0].destroyed).toBe(true)
    expect(contentRenderer.live).toHaveLength(0)

    // `_paint` must bail out before ever reaching `_onStepPainted`, so no
    // recovery subscription is armed against the root-provided registry.
    expect(
      (registry as unknown as { _changes: { observers: unknown[] } })._changes
        .observers,
    ).toHaveLength(0)

    // The adapter must not be driven any further once the session has closed.
    expect(adapter.calls).toEqual(['start', 'destroy'])

    target.remove()
  }))
})
