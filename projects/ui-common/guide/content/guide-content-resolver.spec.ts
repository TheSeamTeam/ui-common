import { TemplateRef, Type } from '@angular/core'

import { TheSeamGuideContentContext } from '../models/guide-content'
import { resolveGuideContentSlot } from './guide-content-resolver'

const tpl = {} as TemplateRef<TheSeamGuideContentContext>
const otherTpl = {} as TemplateRef<TheSeamGuideContentContext>
class CmpA {}
class CmpB {}
const cmpA = CmpA as Type<unknown>
const cmpB = CmpB as Type<unknown>

describe('resolveGuideContentSlot presence', () => {
  it('is absent when no layer supplies the slot', () => {
    expect(resolveGuideContentSlot({})).toBeNull()
  })

  it('is absent when only the provider layer supplies it', () => {
    expect(
      resolveGuideContentSlot({ provider: { component: cmpA } }),
    ).toBeNull()
  })

  it('is present when the session layer supplies it', () => {
    expect(resolveGuideContentSlot({ session: 'from session' })).toEqual({
      kind: 'text',
      text: 'from session',
    })
  })

  it('is present when the step layer supplies it', () => {
    expect(resolveGuideContentSlot({ step: 'from step' })).toEqual({
      kind: 'text',
      text: 'from step',
    })
  })

  it('is absent when the step clears a session-supplied slot', () => {
    expect(
      resolveGuideContentSlot({ session: 'from session', step: null }),
    ).toBeNull()
  })

  it('is absent when a renderer resolves but there is no text and no data', () => {
    // Only the provider names a renderer, so nothing made the slot present.
    expect(resolveGuideContentSlot({ provider: { template: tpl } })).toBeNull()
  })

  it('is absent when the step supplies only data and no renderer exists', () => {
    expect(
      resolveGuideContentSlot({ step: { data: { icon: 'star' } } }),
    ).toBeNull()
  })
})

describe('resolveGuideContentSlot renderer', () => {
  it('uses the provider renderer for a bare step string', () => {
    expect(
      resolveGuideContentSlot({
        provider: { component: cmpA, data: { icon: 'app' } },
        step: 'Step One',
      }),
    ).toEqual({
      kind: 'component',
      component: cmpA,
      text: 'Step One',
      data: { icon: 'app' },
    })
  })

  it('lets the step renderer replace the provider renderer', () => {
    const result = resolveGuideContentSlot({
      provider: { component: cmpA },
      step: { component: cmpB, text: 'Step Two' },
    })
    expect(result).toEqual({
      kind: 'component',
      component: cmpB,
      text: 'Step Two',
      data: {},
    })
  })

  it('takes the whole renderer from the nearest layer that names one', () => {
    // The step names a template, so the session's component must not win even
    // though it is a different kind.
    const result = resolveGuideContentSlot({
      session: { component: cmpA },
      step: { template: tpl },
    })
    expect(result).toEqual({
      kind: 'template',
      template: tpl,
      text: undefined,
      data: {},
    })
  })

  it('prefers the session renderer over the provider renderer', () => {
    const result = resolveGuideContentSlot({
      provider: { template: otherTpl },
      session: { template: tpl },
      step: 'text',
    })
    expect(result).toEqual({
      kind: 'template',
      template: tpl,
      text: 'text',
      data: {},
    })
  })
})

describe('resolveGuideContentSlot data and text', () => {
  it('shallow-merges data outermost first', () => {
    const result = resolveGuideContentSlot({
      provider: { component: cmpA, data: { icon: 'app', size: 'lg' } },
      session: { data: { size: 'sm', tone: 'info' } },
      step: { data: { icon: 'step' } },
    })
    expect(result).toEqual({
      kind: 'component',
      component: cmpA,
      text: undefined,
      data: { icon: 'step', size: 'sm', tone: 'info' },
    })
  })

  it('does not merge data deeply', () => {
    const result = resolveGuideContentSlot({
      provider: { component: cmpA, data: { badge: { a: 1, b: 2 } } },
      step: { data: { badge: { a: 9 } } },
    })
    expect(result).toMatchObject({ data: { badge: { a: 9 } } })
  })

  it('takes text from the nearest layer that defines it', () => {
    const result = resolveGuideContentSlot({
      provider: { component: cmpA, text: 'provider' },
      session: { text: 'session' },
      step: { data: {} },
    })
    expect(result).toMatchObject({ text: 'session' })
  })

  it('treats a bare string as text at its own layer', () => {
    const result = resolveGuideContentSlot({
      provider: { component: cmpA },
      session: 'session text',
      step: { data: { icon: 'step' } },
    })
    expect(result).toEqual({
      kind: 'component',
      component: cmpA,
      text: 'session text',
      data: { icon: 'step' },
    })
  })

  it('falls back to a plain string when no layer names a renderer', () => {
    expect(
      resolveGuideContentSlot({
        provider: { data: { icon: 'app' } },
        step: 'just text',
      }),
    ).toEqual({ kind: 'text', text: 'just text' })
  })
})
