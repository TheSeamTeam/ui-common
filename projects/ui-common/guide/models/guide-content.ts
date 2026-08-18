import { InjectionToken, TemplateRef, Type } from '@angular/core'

import type { TheSeamGuideRef } from '../guide-ref'
import type { TheSeamGuideStep } from './guide-step'

/**
 * Application-defined values handed to popover content.
 *
 * The library reserves **no keys** here. That is why `text` is a sibling field
 * on the content spec rather than a well-known key in this bag: an application
 * can name its data anything without colliding with the guide.
 */
export type TheSeamGuideContentData = Record<string, unknown>

export interface TheSeamGuideContentBase {
  /** The slot's plain text. A bare string is sugar for this. Nearest-wins. */
  text?: string
  /** Shallow-merged across provider -> session -> step. */
  data?: TheSeamGuideContentData
}

export interface TheSeamGuideTemplateContent extends TheSeamGuideContentBase {
  template: TemplateRef<TheSeamGuideContentContext>
  component?: never
}

export interface TheSeamGuideComponentContent extends TheSeamGuideContentBase {
  component: Type<unknown>
  template?: never
}

/** Text and/or data for whichever renderer an outer layer supplies. */
export interface TheSeamGuideInheritedContent extends TheSeamGuideContentBase {
  template?: never
  component?: never
}

/**
 * The `never` guards make `template` and `component` on one object a compile
 * error, rather than a runtime precedence rule nobody remembers.
 */
export type TheSeamGuideContentSpec =
  | TheSeamGuideTemplateContent
  | TheSeamGuideComponentContent
  | TheSeamGuideInheritedContent

export type TheSeamGuideContent = string | TheSeamGuideContentSpec

/**
 * What popover content receives. Templates get this as their context;
 * components get it from {@link THE_SEAM_GUIDE_CONTENT}.
 *
 * `data` is never spread, so `let-index` is unambiguously the step index and
 * never an application value.
 */
export interface TheSeamGuideContentContext {
  /** `data`, so `let-d` in a template reads `d.icon`. */
  $implicit: TheSeamGuideContentData
  data: TheSeamGuideContentData
  text: string | undefined
  step: TheSeamGuideStep
  index: number
  total: number
  guide: TheSeamGuideRef
}

/** Injected by a component used as popover content. */
export const THE_SEAM_GUIDE_CONTENT =
  new InjectionToken<TheSeamGuideContentContext>('THE_SEAM_GUIDE_CONTENT')

/** One popover slot after its three layers are resolved. */
export type TheSeamGuideResolvedSlot =
  | { kind: 'text'; text: string }
  | {
      kind: 'template'
      template: TemplateRef<TheSeamGuideContentContext>
      text: string | undefined
      data: TheSeamGuideContentData
    }
  | {
      kind: 'component'
      component: Type<unknown>
      text: string | undefined
      data: TheSeamGuideContentData
    }

/** A resolved slot that needs an Angular view. */
export type TheSeamGuideViewSlot = Exclude<
  TheSeamGuideResolvedSlot,
  { kind: 'text' }
>

/** A rendered slot. Destroying it tears the view down. */
export interface TheSeamGuideContentView {
  destroy(): void
}

/**
 * Published so `testing/` can fake it, exactly as `TheSeamGuideAdapter` is.
 * The DOM implementation itself is internal.
 */
export interface TheSeamGuideContentRenderer {
  render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView
}
