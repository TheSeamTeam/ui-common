import { TemplateRef } from '@angular/core'
import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideContentContext } from './models/guide-content'
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
    const { session, contentRenderer } = makeSession(
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
    const host = popoverAt(adapter, 0)?.title
    session.refresh()
    tick()

    expect(contentRenderer.renders[0].host).toBe(host)
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
