import {
  TheSeamGuideContentContext,
  TheSeamGuideContentRenderer,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
} from '../models/guide-content'

export interface TheSeamFakeGuideContentRender {
  slot: TheSeamGuideViewSlot
  context: TheSeamGuideContentContext
  host: HTMLElement
  destroyed: boolean
}

/**
 * Angular-free renderer for specs. Records what the session asked to render so
 * a test can assert view lifetime without a `TestBed`.
 */
export class TheSeamFakeGuideContentRenderer
  implements TheSeamGuideContentRenderer
{
  readonly renders: TheSeamFakeGuideContentRender[] = []

  render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView {
    const record: TheSeamFakeGuideContentRender = {
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
  get live(): TheSeamFakeGuideContentRender[] {
    return this.renders.filter((r) => !r.destroyed)
  }
}
