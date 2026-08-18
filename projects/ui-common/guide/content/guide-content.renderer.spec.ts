import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  ViewChild,
  OnDestroy,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { TheSeamGuideRef } from '../guide-ref'
import {
  TheSeamGuideContentContext,
  THE_SEAM_GUIDE_CONTENT,
} from '../models/guide-content'
import { TheSeamGuideDomContentRenderer } from './guide-content.renderer'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tpl let-d let-text="text" let-i="index" let-n="total">
      <span class="out">{{ d.icon }}|{{ text }}|{{ i }}|{{ n }}</span>
    </ng-template>
  `,
})
class TemplateHostComponent {
  @ViewChild('tpl', { static: true })
  tpl!: TemplateRef<TheSeamGuideContentContext>
}

@Component({
  selector: 'seam-content-probe',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="out">{{ _ctx.data['icon'] }}|{{ _ctx.text }}</span>`,
})
class ContentProbeComponent implements OnDestroy {
  readonly _ctx = inject(THE_SEAM_GUIDE_CONTENT)
  readonly guide = inject(TheSeamGuideRef)
  static destroyed = 0
  ngOnDestroy(): void {
    ContentProbeComponent.destroyed++
  }
}

function makeContext(
  over: Partial<TheSeamGuideContentContext> = {},
): TheSeamGuideContentContext {
  const data = over.data ?? { icon: 'star' }
  return {
    $implicit: data,
    data,
    text: 'the text',
    step: {},
    index: 1,
    total: 4,
    guide: {} as TheSeamGuideRef,
    ...over,
  }
}

describe('TheSeamGuideDomContentRenderer', () => {
  let renderer: TheSeamGuideDomContentRenderer
  let appRef: ApplicationRef
  let host: HTMLElement

  beforeEach(() => {
    ContentProbeComponent.destroyed = 0
    TestBed.configureTestingModule({})
    renderer = TestBed.inject(TheSeamGuideDomContentRenderer)
    appRef = TestBed.inject(ApplicationRef)
    host = document.createElement('div')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders a template with its context into the host', () => {
    const fixture = TestBed.createComponent(TemplateHostComponent)
    const view = renderer.render(
      {
        kind: 'template',
        template: fixture.componentInstance.tpl,
        text: 'the text',
        data: { icon: 'star' },
      },
      makeContext(),
      host,
    )
    appRef.tick()

    expect(host.querySelector('.out')?.textContent).toBe('star|the text|1|4')
    view.destroy()
  })

  it('detaches the template view from ApplicationRef on destroy', () => {
    const fixture = TestBed.createComponent(TemplateHostComponent)
    const before = appRef.viewCount
    const view = renderer.render(
      {
        kind: 'template',
        template: fixture.componentInstance.tpl,
        text: 'the text',
        data: { icon: 'star' },
      },
      makeContext(),
      host,
    )
    expect(appRef.viewCount).toBe(before + 1)

    view.destroy()

    // This pins that no view is left attached to `ApplicationRef` after
    // `destroy()`. It can't distinguish the explicit `detachView` call from
    // Angular's own auto-detach (`ViewRef.destroy()` also calls
    // `this._appRef.detachView(this)` as of 20.3.15), so the explicit call is
    // kept deliberately rather than relying on that internal behavior.
    expect(appRef.viewCount).toBe(before)
  })

  it('renders a component and gives it the context and the ref', () => {
    const guide = {} as TheSeamGuideRef
    const view = renderer.render(
      {
        kind: 'component',
        component: ContentProbeComponent,
        text: 'the text',
        data: { icon: 'star' },
      },
      makeContext({ guide }),
      host,
    )
    appRef.tick()

    expect(host.querySelector('.out')?.textContent).toBe('star|the text')
    view.destroy()
  })

  it('detaches the view from ApplicationRef on destroy', () => {
    const before = appRef.viewCount
    const view = renderer.render(
      {
        kind: 'component',
        component: ContentProbeComponent,
        text: undefined,
        data: {},
      },
      makeContext(),
      host,
    )
    expect(appRef.viewCount).toBe(before + 1)

    view.destroy()

    expect(appRef.viewCount).toBe(before)
    expect(ContentProbeComponent.destroyed).toBe(1)
  })
})
