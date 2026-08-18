import {
  TheSeamGuideContentContext,
  TheSeamGuideContentRenderer,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
} from '../models/guide-content'

export interface FakeGuideContentRender {
  slot: TheSeamGuideViewSlot
  context: TheSeamGuideContentContext
  host: HTMLElement
  destroyed: boolean
}

/**
 * Angular-free renderer for specs. Records what the session asked to render so
 * a test can assert view lifetime without a `TestBed`.
 */
export class FakeGuideContentRenderer implements TheSeamGuideContentRenderer {
  readonly renders: FakeGuideContentRender[] = []

  render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView {
    const record: FakeGuideContentRender = {
      slot,
      context,
      host,
      destroyed: false,
    }
    this.renders.push(record)
    host.textContent = context.text ?? ''
    return {
      destroy: () => {
        record.destroyed = true
      },
    }
  }

  /** Renders that have not been destroyed. */
  get live(): FakeGuideContentRender[] {
    return this.renders.filter((r) => !r.destroyed)
  }
}
