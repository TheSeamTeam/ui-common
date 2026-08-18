# Guide Popover Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `title` and `description` on a guide popover be a string, a `TemplateRef`, or a standalone component, resolved across three layers (provider, session, step).

**Architecture:** Renderer and data are separate axes. The renderer resolves nearest-wins (step, else session, else provider); `data` shallow-merges outermost-first; `text` resolves nearest-wins and is what a bare string desugars to. A pure function does the resolution, a `providedIn: 'root'` service creates the Angular view into a session-owned host element, and the adapter only ever receives a `string` or an `HTMLElement`. That last property is what keeps the adapter engine-agnostic.

**Tech Stack:** Angular 20.3, driver.js 1.8, Jest + jsdom, Storybook 9, ng-packagr.

**Spec:** `docs/superpowers/specs/2026-08-13-guide-module-design.md` — the **Popover content** section, revised 2026-08-17. Read that section before starting; this plan implements it and does not repeat its reasoning.

## Global Constraints

- **Prettier: no semicolons**, single quotes, 2-space indent, trailing commas, arrow parens always. Run `npm run lint:format` if unsure.
- **All exported types use the `TheSeam` prefix.** Do not prefix interfaces with `I`.
- **Private members are prefixed `_`.** Injected members are `readonly` and use `inject()`.
- **`driver.js` may be imported in exactly one file**: `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts`. Verify with `grep -rn "from 'driver\.js'" projects/ui-common/guide --include=*.ts` — exactly one hit, always.
- **`ChangeDetectionStrategy.OnPush`** on any component.
- **Test output must be pristine.** `console.warn` spies go per-test, never suite-level, restored via `afterEach(() => jest.restoreAllMocks())`.
- **In stories, import from `storybook/test`**, not `@storybook/test`. Use `applicationConfig({ providers: [...] })`, never `moduleMetadata` — `provideTheSeamGuide()` returns `EnvironmentProviders`.
- **Nothing type-checks stories except `.storybook/tsconfig.json`.** `npx tsc --noEmit -p .storybook/tsconfig.json` is the only command that catches a TS error in a `.stories.ts` file.
- Run Jest for this module with `npx jest projects/ui-common/guide`. Baseline before any change: **910 tests / 111 suites passing**.

---

## File Structure

**Created:**

| File | Responsibility |
| --- | --- |
| `projects/ui-common/guide/models/guide-content.ts` | Every published content type: the `TheSeamGuideContent` union, the template context, the resolved-slot result types, the renderer interface, the DI token. |
| `projects/ui-common/guide/models/exhaustive-map.ts` | `ExhaustiveMap<Src, Dst>` — the one type that makes a dropped popover field a compile error. Internal; never appears in a `.d.ts`. |
| `projects/ui-common/guide/content/guide-content-resolver.ts` | One pure function: three layers in, a resolved slot or `null` out. No Angular, no DOM. |
| `projects/ui-common/guide/content/guide-content-resolver.spec.ts` | Resolution rules. |
| `projects/ui-common/guide/content/guide-content.renderer.ts` | `TheSeamGuideDomContentRenderer` — creates and destroys the Angular view. The only file that touches `ApplicationRef`. |
| `projects/ui-common/guide/content/guide-content.renderer.spec.ts` | Both arms, the context and DI each receives, teardown. |
| `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts` | driver.js popover DOM, in jsdom. |
| `projects/ui-common/guide/testing/fake-guide-content.renderer.ts` | `FakeGuideContentRenderer` — records calls, no Angular. |
| `projects/ui-common/guide/guide-session-content.spec.ts` | Session slot lifecycle against the two fakes. |
| `projects/ui-common/guide/guide-content.stories.ts` | Real driver.js, real Angular views, visibility assertions. |

**Modified:**

| File | Change |
| --- | --- |
| `models/guide-step.ts` | `TheSeamGuidePopover.title` / `.description` widen to `TheSeamGuideContent \| null`. |
| `models/guide-config.ts` | `TheSeamGuideConfig.popover`; exclude it from `TheSeamGuideResolvedConfig`. |
| `adapter/guide-adapter.ts` | Extract `TheSeamGuideAdapterPopover`; `title` widens to `string \| HTMLElement`. |
| `adapter/driver-js/driver-js-guide.adapter.ts` | Both slots through `onPopoverRender`; un-hide filled slots; exhaustive mapper. |
| `guide-providers.ts` | `popover` option and `THE_SEAM_GUIDE_POPOVER_DEFAULTS` token. |
| `guide-session.ts` | Constructor takes a deps object; slot resolution, host allocation, view lifecycle; exhaustive mapper. |
| `guide.service.ts` | Inject renderer and provider defaults; pass `getRef`. |
| `guide-session.spec.ts`, `guide-session-recovery.spec.ts` | `makeSession` helper updated for the deps object. |
| `public-api.ts` | Export `models/guide-content`. |
| `testing/index.ts` | Export the fake renderer. |

**Task order rationale:** Tasks 1–3 add isolated, fully tested units that nothing yet consumes, so each is independently green. Task 4 introduces the three layers while `TheSeamGuidePopover` is still string-only — a shippable feature on its own. Task 5 widens the type, which is the one change that cannot be made without the session handling it, so the widening and the view lifecycle land together. Task 6 is the real-engine proof.

---

### Task 1: Content types and the pure resolver

**Files:**
- Create: `projects/ui-common/guide/models/guide-content.ts`
- Create: `projects/ui-common/guide/content/guide-content-resolver.ts`
- Test: `projects/ui-common/guide/content/guide-content-resolver.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`

**Interfaces:**
- Consumes: `TheSeamGuideStep` from `models/guide-step`, `TheSeamGuideRef` from `guide-ref` — both **type-only imports**, to keep a runtime import cycle from forming.
- Produces: `TheSeamGuideContent`, `TheSeamGuideContentSpec`, `TheSeamGuideContentData`, `TheSeamGuideContentContext`, `TheSeamGuideResolvedSlot`, `TheSeamGuideViewSlot`, `TheSeamGuideContentView`, `TheSeamGuideContentRenderer` (interface), `THE_SEAM_GUIDE_CONTENT` (token), and `resolveGuideContentSlot(layers)`.

- [ ] **Step 1: Create the content model file**

Create `projects/ui-common/guide/models/guide-content.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing resolver test**

Create `projects/ui-common/guide/content/guide-content-resolver.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx jest projects/ui-common/guide/content/guide-content-resolver.spec.ts`

Expected: FAIL — `Cannot find module './guide-content-resolver'`.

- [ ] **Step 4: Implement the resolver**

Create `projects/ui-common/guide/content/guide-content-resolver.ts`:

```ts
import {
  TheSeamGuideContent,
  TheSeamGuideContentData,
  TheSeamGuideContentSpec,
  TheSeamGuideResolvedSlot,
} from '../models/guide-content'

/** The three layers for one popover slot. */
export interface TheSeamGuideContentLayers {
  provider?: TheSeamGuideContent | null
  session?: TheSeamGuideContent | null
  step?: TheSeamGuideContent | null
}

/** A bare string is sugar for `{ text }`. */
function normalize(
  value: TheSeamGuideContent | null | undefined,
): TheSeamGuideContentSpec | null | undefined {
  if (value === undefined || value === null) {
    return value
  }
  return typeof value === 'string' ? { text: value } : value
}

/**
 * Resolves one popover slot from its three layers. `null` means the slot is
 * absent and nothing is rendered for it.
 *
 * Presence and content are decided separately: only the step and session
 * layers can make a slot present, but once it is, all three layers contribute
 * the renderer, the text, and the data. That is what lets a step say
 * `title: 'Step One'` and still get the application's title component.
 */
export function resolveGuideContentSlot(
  layers: TheSeamGuideContentLayers,
): TheSeamGuideResolvedSlot | null {
  const presence = layers.step !== undefined ? layers.step : layers.session
  if (presence === undefined || presence === null) {
    return null
  }

  const provider = normalize(layers.provider)
  const session = normalize(layers.session)
  const step = normalize(layers.step)

  const nearestFirst = [step, session, provider]
  const outermostFirst = [provider, session, step]

  // One search for the renderer, not one per kind: the nearest layer naming
  // either wins outright, so a step's template beats a session's component.
  const renderer = nearestFirst.find(
    (layer) => layer?.template != null || layer?.component != null,
  )
  const text = nearestFirst.find((layer) => layer?.text !== undefined)?.text

  const data: TheSeamGuideContentData = {}
  for (const layer of outermostFirst) {
    if (layer?.data !== undefined) {
      Object.assign(data, layer.data)
    }
  }

  if (renderer?.template != null) {
    return { kind: 'template', template: renderer.template, text, data }
  }
  if (renderer?.component != null) {
    return { kind: 'component', component: renderer.component, text, data }
  }
  return text === undefined ? null : { kind: 'text', text }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx jest projects/ui-common/guide/content/guide-content-resolver.spec.ts`

Expected: PASS, 16 tests.

- [ ] **Step 6: Export the content model**

In `projects/ui-common/guide/public-api.ts`, add after the `guide-step` line:

```ts
export * from './models/guide-content'
```

- [ ] **Step 7: Run the full module suite and lint**

Run: `npx jest projects/ui-common/guide` — expected: PASS, 926 tests / 112 suites.
Run: `npm run lint` — expected: 0 errors (48 pre-existing warnings).

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/guide/models/guide-content.ts \
        projects/ui-common/guide/content/ \
        projects/ui-common/guide/public-api.ts
git commit -m "feat(guide): add popover content types and layer resolver"
```

---

### Task 2: Widen the adapter boundary and fix the driver.js element path

**Files:**
- Create: `projects/ui-common/guide/models/exhaustive-map.ts`
- Modify: `projects/ui-common/guide/adapter/guide-adapter.ts`
- Modify: `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts`
- Test: `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `TheSeamGuideAdapterPopover` with `title?: string | HTMLElement` and `description?: string | HTMLElement`, exported from `adapter/guide-adapter`; `ExhaustiveMap<Src, Dst = Src>` from `models/exhaustive-map`, used again in Tasks 4 and 5.

**Why this task exists independently:** the v1 `HTMLElement` branch has never had a caller and does not work. driver.js sets `display: none` on any slot whose string is falsy, and the adapter passes `undefined` for the element case, so the node lands in a hidden container. Verified in jsdom before this plan was written.

- [ ] **Step 1: Write the failing adapter test**

Create `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`:

```ts
import { TheSeamGuideAdapterPopover } from '../guide-adapter'
import { DriverJsGuideAdapter } from './driver-js-guide.adapter'

describe('DriverJsGuideAdapter popover slots', () => {
  let adapter: DriverJsGuideAdapter

  beforeEach(() => {
    document.body.innerHTML = ''
    adapter = new DriverJsGuideAdapter()
  })

  afterEach(() => {
    adapter.destroy()
    jest.restoreAllMocks()
  })

  function drive(popover: TheSeamGuideAdapterPopover): void {
    const el = document.createElement('div')
    document.body.appendChild(el)
    adapter.start(
      { steps: [{ element: () => el, popover }], allowUserDismiss: true },
      {
        onNextRequested: () => {},
        onPreviousRequested: () => {},
        onCloseRequested: () => {},
      },
    )
    adapter.moveTo(0)
  }

  function slot(name: 'title' | 'description'): HTMLElement {
    const el = document.querySelector<HTMLElement>(`.driver-popover-${name}`)
    expect(el).toBeTruthy()
    return el as HTMLElement
  }

  it('renders a string title and description', () => {
    drive({ title: 'a title', description: 'a description' })
    expect(slot('title').textContent).toBe('a title')
    expect(slot('description').textContent).toBe('a description')
  })

  it('places an element description and makes it visible', () => {
    const host = document.createElement('div')
    host.textContent = 'from a view'
    drive({ description: host })

    // The visibility half is the regression: driver.js hides a slot whose
    // string is falsy, so populating it is not enough on its own.
    expect(slot('description').contains(host)).toBe(true)
    expect(slot('description').style.display).toBe('block')
  })

  it('places an element title and makes it visible', () => {
    const host = document.createElement('div')
    host.textContent = 'a view title'
    drive({ title: host })

    expect(slot('title').contains(host)).toBe(true)
    expect(slot('title').style.display).toBe('block')
  })

  it('fills both slots with elements at once', () => {
    const titleHost = document.createElement('div')
    titleHost.textContent = 'view title'
    const descHost = document.createElement('div')
    descHost.textContent = 'view description'
    drive({ title: titleHost, description: descHost })

    expect(slot('title').contains(titleHost)).toBe(true)
    expect(slot('description').contains(descHost)).toBe(true)
  })

  it('re-adopts the same host node when the step is re-driven', () => {
    const host = document.createElement('div')
    host.textContent = 'from a view'
    drive({ description: host })

    // driver.js rebuilds its whole popover on every render, so refresh()
    // orphans the host and the hook must take it back. This is what lets a
    // view survive mid-step recovery instead of being re-created.
    adapter.refresh()

    expect(slot('description').contains(host)).toBe(true)
    expect(slot('description').style.display).toBe('block')
  })

  it('keeps side and align on the drive step', () => {
    drive({ description: 'text', side: 'right', align: 'end' })
    expect(document.querySelector('.driver-popover')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest projects/ui-common/guide/adapter/driver-js`

Expected: FAIL. `'places an element description and makes it visible'` fails on `expect(...style.display).toBe('block')` — received `"none"`. `'places an element title and makes it visible'` fails because `title` is not yet accepted as an `HTMLElement` (a TypeScript error on the test's `drive({ title: host })` call).

- [ ] **Step 3: Add the exhaustiveness helper, then widen the adapter popover type**

Create `projects/ui-common/guide/models/exhaustive-map.ts`:

```ts
/**
 * Maps every key of `Src` to `Dst`'s type for that key, **required** but still
 * allowed to be `undefined`.
 *
 * Annotating a hand-written mapping literal with this makes a forgotten field a
 * compile error (TS2741) instead of a silently dropped value. A wholesale
 * spread cannot do that: TypeScript exempts spread properties from
 * excess-property checking, which is how `side` and `align` were once dropped
 * on the session-to-adapter hop.
 *
 * Two details are load-bearing, and both were verified before this was written:
 *
 * - `& string` makes the mapped type non-homomorphic. Written plainly as
 *   `{ [K in keyof Src]-?: Dst[K] | undefined }`, the `-?` strips `undefined`
 *   from the value type as well as the optional marker, so `side: undefined`
 *   would not compile.
 * - The key set comes from `Src` alone, with the conditional supplying the
 *   value type. Keying off `keyof Src & keyof Dst` looks equivalent but is
 *   not: a field added to `Src` and not yet to `Dst` would fall out of the
 *   intersection and be silently exempt — precisely the case this exists to
 *   catch. Here it resolves to `never`, which no value satisfies.
 */
export type ExhaustiveMap<Src, Dst = Src> = {
  [K in keyof Src & string]-?: K extends keyof Dst ? Dst[K] | undefined : never
}
```

Then, in `projects/ui-common/guide/adapter/guide-adapter.ts`, replace the inline popover type on `TheSeamGuideAdapterStep` with a named, exported one:

```ts
/**
 * A popover as the presentation engine sees it.
 *
 * `HTMLElement` carries template and component content. The service creates,
 * owns, and destroys that node; the adapter only places it, which is what
 * keeps the adapter free of Angular.
 */
export interface TheSeamGuideAdapterPopover {
  title?: string | HTMLElement
  description?: string | HTMLElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

/**
 * A step as the presentation engine sees it.
 *
 * `element` is a resolver function, not an element, so the engine re-resolves
 * at paint time. That is what makes mid-step recovery a `refresh()` rather than
 * a step transition.
 */
export interface TheSeamGuideAdapterStep {
  element?: () => Element | undefined
  popover?: TheSeamGuideAdapterPopover
}
```

- [ ] **Step 4: Rewrite the driver.js popover mapping**

In `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts`, change the import on line 2 to add `PopoverDOM`:

```ts
import { Config, DriveStep, driver, Driver, PopoverDOM } from 'driver.js'
```

Add `TheSeamGuideAdapterPopover` to the import from `'../guide-adapter'`, add

```ts
import { ExhaustiveMap } from '../../models/exhaustive-map'
```

then replace the whole `_toDriveStep` method with these two:

```ts
  private _toDriveStep(step: TheSeamGuideAdapterStep): DriveStep {
    // Typed honestly as `Element | undefined`, matching what the resolver
    // can actually return — `undefined` is a real outcome, not an absent
    // one, since the elementless path depends on it.
    const resolveElement: (() => Element | undefined) | undefined =
      step.element === undefined ? undefined : () => step.element?.()
    return {
      // driver.js's own public type only declares `() => Element`, but its
      // runtime falls back to a centered popover when the resolver returns
      // `undefined`. This cast crosses that documentation gap at the one
      // point it matters; `resolveElement` above keeps `undefined` visible
      // everywhere else in this method.
      element: resolveElement as (() => Element) | undefined,
      popover:
        step.popover === undefined
          ? undefined
          : this._toDrivePopover(step.popover),
    }
  }

  /**
   * `ExhaustiveMap` makes every key of `TheSeamGuideAdapterPopover` required
   * in `mapped`, so adding a field to the boundary is a compile error here
   * until it is carried through.
   */
  private _toDrivePopover(
    popover: TheSeamGuideAdapterPopover,
  ): NonNullable<DriveStep['popover']> {
    const mapped: ExhaustiveMap<TheSeamGuideAdapterPopover> = {
      title: popover.title,
      description: popover.description,
      side: popover.side,
      align: popover.align,
    }
    const { title, description, side, align } = mapped
    const hasNode = title instanceof HTMLElement ||
      description instanceof HTMLElement

    return {
      title: typeof title === 'string' ? title : undefined,
      description: typeof description === 'string' ? description : undefined,
      side,
      align,
      // driver.js hides a slot whose string is falsy, so a slot filled with a
      // node must be un-hidden as well as populated. It also rebuilds the
      // whole popover on every render, so this runs again on each re-drive
      // and simply re-adopts the same host node.
      onPopoverRender: hasNode
        ? (dom: PopoverDOM) => {
            if (title instanceof HTMLElement) {
              dom.title.replaceChildren(title)
              dom.title.style.display = 'block'
            }
            if (description instanceof HTMLElement) {
              dom.description.replaceChildren(description)
              dom.description.style.display = 'block'
            }
          }
        : undefined,
    }
  }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx jest projects/ui-common/guide/adapter/driver-js`

Expected: PASS, 6 tests.

- [ ] **Step 6: Verify the driver.js import is still confined**

Run: `grep -rn "from 'driver\.js'" projects/ui-common/guide --include=*.ts`

Expected: exactly one line, `adapter/driver-js/driver-js-guide.adapter.ts:2`.

- [ ] **Step 7: Run the full module suite and lint**

Run: `npx jest projects/ui-common/guide` — expected: PASS, 932 tests / 113 suites.
Run: `npm run lint` — expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/guide/adapter/
git commit -m "fix(guide): render element popover slots visibly and widen title"
```

---

### Task 3: The content renderer

**Files:**
- Create: `projects/ui-common/guide/content/guide-content.renderer.ts`
- Test: `projects/ui-common/guide/content/guide-content.renderer.spec.ts`

**Interfaces:**
- Consumes: `TheSeamGuideViewSlot`, `TheSeamGuideContentContext`, `TheSeamGuideContentView`, `TheSeamGuideContentRenderer`, `THE_SEAM_GUIDE_CONTENT` from `models/guide-content` (Task 1); `TheSeamGuideRef` from `guide-ref`.
- Produces: `TheSeamGuideDomContentRenderer`, a `providedIn: 'root'` class implementing `TheSeamGuideContentRenderer`. **Not** exported from `public-api.ts` — the interface is published, the implementation is not.

- [ ] **Step 1: Write the failing renderer test**

Create `projects/ui-common/guide/content/guide-content.renderer.spec.ts`:

```ts
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  ViewChild,
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
class ContentProbeComponent {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest projects/ui-common/guide/content/guide-content.renderer.spec.ts`

Expected: FAIL — `Cannot find module './guide-content.renderer'`.

- [ ] **Step 3: Implement the renderer**

Create `projects/ui-common/guide/content/guide-content.renderer.ts`:

```ts
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
} from '@angular/core'

import { TheSeamGuideRef } from '../guide-ref'
import {
  TheSeamGuideContentContext,
  TheSeamGuideContentRenderer,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
  THE_SEAM_GUIDE_CONTENT,
} from '../models/guide-content'

/**
 * Creates and destroys the Angular view behind a popover slot.
 *
 * Separate from `TheSeamGuideSession` so session specs can run against a fake
 * and stay free of a real `ApplicationRef`, and so the session stays free of
 * rendering concerns.
 */
@Injectable({ providedIn: 'root' })
export class TheSeamGuideDomContentRenderer
  implements TheSeamGuideContentRenderer
{
  private readonly _appRef = inject(ApplicationRef)
  private readonly _envInjector = inject(EnvironmentInjector)

  /**
   * Renders `slot` into `host`, which the caller owns.
   *
   * Views are attached to `ApplicationRef` rather than created through a
   * `ViewContainerRef`, because this is a `providedIn: 'root'` service and
   * there is no view container to reach. Attachment is what makes a view
   * change-detected; where its nodes sit in the DOM is independent of it,
   * which is what lets driver.js move `host` around as it rebuilds its
   * popover on every render.
   */
  render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView {
    if (slot.kind === 'template') {
      const view = slot.template.createEmbeddedView(context)
      this._appRef.attachView(view)
      host.append(...view.rootNodes)
      return {
        destroy: () => {
          this._appRef.detachView(view)
          view.destroy()
        },
      }
    }

    const ref = createComponent(slot.component, {
      environmentInjector: this._envInjector,
      // DI rather than `setInput`: `data` is shallow-merged across three
      // layers, so it routinely carries keys a given component never declared
      // as an input, and `setInput` throws NG0303 for those.
      elementInjector: Injector.create({
        parent: this._envInjector,
        providers: [
          { provide: THE_SEAM_GUIDE_CONTENT, useValue: context },
          { provide: TheSeamGuideRef, useValue: context.guide },
        ],
      }),
    })
    this._appRef.attachView(ref.hostView)
    host.append(ref.location.nativeElement)
    return {
      destroy: () => {
        this._appRef.detachView(ref.hostView)
        ref.destroy()
      },
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest projects/ui-common/guide/content/guide-content.renderer.spec.ts`

Expected: PASS, 3 tests.

If `appRef.tick()` throws `ApplicationRef.tick is called recursively`, replace the `appRef.tick()` calls in the spec with `TestBed.tick()`. Do not change the implementation for this — it is a test-harness detail.

- [ ] **Step 5: Run the full module suite and lint**

Run: `npx jest projects/ui-common/guide` — expected: PASS, 935 tests / 114 suites.
Run: `npm run lint` — expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide/content/
git commit -m "feat(guide): add the popover content view renderer"
```

---

### Task 4: Three content layers, strings only

**Files:**
- Modify: `projects/ui-common/guide/guide-providers.ts`
- Modify: `projects/ui-common/guide/models/guide-config.ts`
- Modify: `projects/ui-common/guide/guide-session.ts`
- Modify: `projects/ui-common/guide/guide.service.ts`
- Modify: `projects/ui-common/guide/guide-session.spec.ts:16-22`
- Modify: `projects/ui-common/guide/guide-session-recovery.spec.ts:15-21`
- Test: `projects/ui-common/guide/guide-session-content.spec.ts` (create)

**Interfaces:**
- Consumes: `resolveGuideContentSlot` and `TheSeamGuideResolvedSlot` (Task 1); `TheSeamGuideAdapterPopover` (Task 2).
- Produces: `THE_SEAM_GUIDE_POPOVER_DEFAULTS` token; `TheSeamGuideProviderOptions.popover`; `TheSeamGuideConfig.popover`; `TheSeamGuideSessionDeps` — the session constructor becomes `new TheSeamGuideSession(config, deps)`.

**Why strings only here:** `TheSeamGuidePopover` still declares `title?: string`, so every slot resolves to `kind: 'text'`. This delivers guide-level and application-level popover defaults as a working feature, and isolates the constructor refactor from the view lifecycle. Task 5 widens the type.

- [ ] **Step 1: Write the failing layering test**

Create `projects/ui-common/guide/guide-session-content.spec.ts`:

```ts
import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuidePopover } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function makeSession(
  config: TheSeamGuideConfig,
  popoverDefaults: TheSeamGuidePopover = {},
) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    popoverDefaults,
    onClosed: () => {},
  })
  return { adapter, session }
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest projects/ui-common/guide/guide-session-content.spec.ts`

Expected: FAIL — TypeScript errors: `popover` does not exist on `TheSeamGuideConfig`, and the session constructor takes 4 arguments, not 2.

- [ ] **Step 3: Add the provider layer**

Replace `projects/ui-common/guide/guide-providers.ts` in full:

```ts
import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  Type,
} from '@angular/core'

import {
  THE_SEAM_GUIDE_ADAPTER,
  TheSeamGuideAdapter,
} from './adapter/guide-adapter'
import { DriverJsGuideAdapter } from './adapter/driver-js/driver-js-guide.adapter'
import { TheSeamGuidePopover } from './models/guide-step'

/**
 * Application-wide popover defaults — the outermost of the three content
 * layers. Always provided by {@link provideTheSeamGuide}, defaulting to `{}`.
 */
export const THE_SEAM_GUIDE_POPOVER_DEFAULTS =
  new InjectionToken<TheSeamGuidePopover>('THE_SEAM_GUIDE_POPOVER_DEFAULTS')

export interface TheSeamGuideProviderOptions {
  /** Replace the presentation engine. Defaults to the driver.js adapter. */
  adapter?: Type<TheSeamGuideAdapter>

  /**
   * Popover defaults for every guide in the application. This layer decorates
   * slots that a guide or a step supplies; it never creates one.
   */
  popover?: TheSeamGuidePopover
}

/**
 * Wires the guide's presentation engine.
 *
 * The engine is named only here — no consumer imports driver.js — so replacing
 * it is a change to this call, not to application code.
 */
export function provideTheSeamGuide(
  options: TheSeamGuideProviderOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: THE_SEAM_GUIDE_ADAPTER,
      useClass: options.adapter ?? DriverJsGuideAdapter,
    },
    {
      provide: THE_SEAM_GUIDE_POPOVER_DEFAULTS,
      useValue: options.popover ?? {},
    },
  ])
}
```

- [ ] **Step 4: Add the session layer to the config**

In `projects/ui-common/guide/models/guide-config.ts`, change the import line to also bring in `TheSeamGuidePopover`, add the field after `onTargetLost`, and exclude it from the resolved type:

```ts
import {
  TheSeamGuideMissPolicy,
  TheSeamGuidePopover,
  TheSeamGuideStep,
} from './guide-step'
```

```ts
  /** Policy for a target lost mid-step. Default 'elementless'. */
  onTargetLost?: TheSeamGuideMissPolicy

  /**
   * Popover defaults for every step in this guide — the middle content layer.
   * Decorates slots a step supplies, and can supply a slot itself; a step
   * opts out of one with `null`.
   */
  popover?: TheSeamGuidePopover
}

// `popover` is excluded rather than given a default: it is a content layer
// resolved per slot, not a scalar option with a single fallback value.
export type TheSeamGuideResolvedConfig = Required<
  Omit<TheSeamGuideConfig, 'steps' | 'popover'>
>
```

- [ ] **Step 5: Convert the session constructor to a deps object**

In `projects/ui-common/guide/guide-session.ts`, add these imports:

```ts
import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterPopover,
  TheSeamGuideAdapterStep,
} from './adapter/guide-adapter'
import { resolveGuideContentSlot } from './content/guide-content-resolver'
import { ExhaustiveMap } from './models/exhaustive-map'
import { TheSeamGuidePopover } from './models/guide-step'
```

Add the deps interface above the class:

```ts
/**
 * Everything a session needs that it does not own. A bag rather than
 * positional parameters: the list grows, and a mis-ordered pair of same-typed
 * arguments is a silent bug.
 */
export interface TheSeamGuideSessionDeps {
  adapter: TheSeamGuideAdapter
  registry: TheSeamGuideTargetRegistry
  popoverDefaults: TheSeamGuidePopover
  onClosed: (session: TheSeamGuideSession) => void
}
```

Replace the constructor and its parameter properties. Declare the fields explicitly, since parameter properties are gone:

```ts
  private readonly _adapter: TheSeamGuideAdapter
  private readonly _registry: TheSeamGuideTargetRegistry
  private readonly _popoverDefaults: TheSeamGuidePopover
  private readonly _sessionPopover: TheSeamGuidePopover | undefined
  private readonly _onClosed: (session: TheSeamGuideSession) => void

  constructor(config: TheSeamGuideConfig, deps: TheSeamGuideSessionDeps) {
    this._adapter = deps.adapter
    this._registry = deps.registry
    this._popoverDefaults = deps.popoverDefaults
    this._sessionPopover = config.popover
    this._onClosed = deps.onClosed

    this.steps = config.steps
    this.options = { ...THE_SEAM_GUIDE_DEFAULTS, ...stripUndefined(config) }

    this._transitionSub = this._transitions
      .pipe(
        switchMap((request) =>
          this._runTransition(request.index, request.direction),
        ),
      )
      .subscribe()
  }
```

`stripUndefined` already drops `steps`; add `popover` to the same destructure so it cannot leak into `options`:

```ts
function stripUndefined(
  config: TheSeamGuideConfig,
): Partial<TheSeamGuideResolvedConfig> {
  const { steps: _steps, popover: _popover, ...rest } = config
```

- [ ] **Step 6: Resolve slots in `_toAdapterStep`**

In `projects/ui-common/guide/guide-session.ts`, replace `_toAdapterStep` and add two helpers:

```ts
  /** Element is a resolver function so the engine re-resolves at paint time. */
  protected _toAdapterStep(step: TheSeamGuideStep): TheSeamGuideAdapterStep {
    const popover = this._toAdapterPopover(step)
    return {
      element:
        step.element === undefined
          ? undefined
          : () => this._resolveNow(step) ?? undefined,
      popover,
    }
  }

  /**
   * `ExhaustiveMap` makes every key of `TheSeamGuidePopover` required in
   * `mapped`, so adding a field to the popover is a compile error here until
   * it is carried through. This is the exact hop on which `side` and `align`
   * were once silently dropped by a spread.
   */
  private _toAdapterPopover(
    step: TheSeamGuideStep,
  ): TheSeamGuideAdapterPopover | undefined {
    const title = this._resolveSlot(step, 'title')
    const description = this._resolveSlot(step, 'description')

    const mapped: ExhaustiveMap<
      TheSeamGuidePopover,
      TheSeamGuideAdapterPopover
    > = {
      title: title?.kind === 'text' ? title.text : undefined,
      description: description?.kind === 'text' ? description.text : undefined,
      side: this._nearestScalar(step, 'side'),
      align: this._nearestScalar(step, 'align'),
    }

    return Object.values(mapped).every((value) => value === undefined)
      ? undefined
      : mapped
  }

  private _resolveSlot(step: TheSeamGuideStep, name: 'title' | 'description') {
    return resolveGuideContentSlot({
      provider: this._popoverDefaults[name],
      session: this._sessionPopover?.[name],
      step: step.popover?.[name],
    })
  }

  private _nearestScalar<K extends 'side' | 'align'>(
    step: TheSeamGuideStep,
    key: K,
  ): TheSeamGuidePopover[K] {
    return (
      step.popover?.[key] ??
      this._sessionPopover?.[key] ??
      this._popoverDefaults[key]
    )
  }
```

- [ ] **Step 7: Update the service to supply the deps**

In `projects/ui-common/guide/guide.service.ts`, add the import:

```ts
import { THE_SEAM_GUIDE_POPOVER_DEFAULTS } from './guide-providers'
```

Add the injected default next to the existing ones:

```ts
  private readonly _popoverDefaults =
    inject(THE_SEAM_GUIDE_POPOVER_DEFAULTS, { optional: true }) ?? {}
```

Replace the session construction inside `start()`:

```ts
    const session = new TheSeamGuideSession(config, {
      adapter: this._adapter,
      registry: this._registry,
      popoverDefaults: this._popoverDefaults,
      onClosed: () => this._clearIfCurrent(ref),
    })
```

- [ ] **Step 8: Update the two existing session spec helpers**

In `projects/ui-common/guide/guide-session.spec.ts` and `projects/ui-common/guide/guide-session-recovery.spec.ts`, replace the one `new TheSeamGuideSession(...)` line in each `makeSession` helper with:

```ts
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    popoverDefaults: {},
    onClosed: () => {},
  })
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx jest projects/ui-common/guide/guide-session-content.spec.ts` — expected: PASS, 6 tests.
Run: `npx jest projects/ui-common/guide` — expected: PASS, 941 tests / 115 suites. Every pre-existing session spec must still pass; if one fails, the deps refactor changed behavior and must be corrected rather than the spec.

- [ ] **Step 10: Lint and commit**

Run: `npm run lint` — expected: 0 errors.

```bash
git add projects/ui-common/guide/
git commit -m "feat(guide): layer popover defaults across provider, guide, and step"
```

---

### Task 5: Widen the popover type and render views

**Files:**
- Modify: `projects/ui-common/guide/models/guide-step.ts:7-12`
- Modify: `projects/ui-common/guide/guide-session.ts`
- Modify: `projects/ui-common/guide/guide.service.ts`
- Create: `projects/ui-common/guide/testing/fake-guide-content.renderer.ts`
- Modify: `projects/ui-common/guide/testing/index.ts`
- Modify: `projects/ui-common/guide/guide-session-content.spec.ts`

**Interfaces:**
- Consumes: everything from Tasks 1, 3, 4.
- Produces: `TheSeamGuidePopover.title` / `.description` typed `TheSeamGuideContent | null`; `FakeGuideContentRenderer`; `TheSeamGuideSessionDeps` gains `contentRenderer: TheSeamGuideContentRenderer` and `getRef: () => TheSeamGuideRef`.

- [ ] **Step 1: Create the fake renderer**

Create `projects/ui-common/guide/testing/fake-guide-content.renderer.ts`:

```ts
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
```

Add to `projects/ui-common/guide/testing/index.ts`:

```ts
export * from './fake-guide-content.renderer'
```

- [ ] **Step 2: Write the failing view-lifecycle test**

Append to `projects/ui-common/guide/guide-session-content.spec.ts`. Also update its existing `makeSession` helper to build and return the renderer and the ref:

```ts
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
```

Add these imports to the top of the file:

```ts
import { TheSeamGuideRef } from './guide-ref'
import { FakeGuideContentRenderer } from './testing/fake-guide-content.renderer'
```

Then append this describe block:

```ts
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
      steps: [{ popover: { title: { component: TitleComponent, text: 'One' } } }],
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
      steps: [{ popover: { title: { component: TitleComponent, text: 'One' } } }],
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
      steps: [{ popover: { title: { component: TitleComponent, text: 'One' } } }],
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
```

Add these imports for the block above:

```ts
import { TemplateRef } from '@angular/core'

import { TheSeamGuideContentContext } from './models/guide-content'
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx jest projects/ui-common/guide/guide-session-content.spec.ts`

Expected: FAIL — TypeScript errors: `{ component: TitleComponent }` is not assignable to `string | undefined`, and `contentRenderer` / `getRef` are not in `TheSeamGuideSessionDeps`.

- [ ] **Step 4: Widen the popover model**

In `projects/ui-common/guide/models/guide-step.ts`, add the import and replace `TheSeamGuidePopover`:

```ts
import type { TheSeamGuideContent } from './guide-content'
```

```ts
export interface TheSeamGuidePopover {
  /**
   * A string, a `TemplateRef`, or a standalone component.
   *
   * Omitting inherits from the guide and application layers. `null` opts this
   * step out of a slot the guide layer supplies — omission cannot express
   * that, because omission means "inherit".
   */
  title?: TheSeamGuideContent | null
  description?: TheSeamGuideContent | null
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}
```

- [ ] **Step 5: Add slot bindings and the view lifecycle to the session**

In `projects/ui-common/guide/guide-session.ts`, extend the deps interface:

```ts
export interface TheSeamGuideSessionDeps {
  adapter: TheSeamGuideAdapter
  registry: TheSeamGuideTargetRegistry
  contentRenderer: TheSeamGuideContentRenderer
  popoverDefaults: TheSeamGuidePopover
  /**
   * The ref is created after the session, so it is reached lazily. Only ever
   * called at step-entry time, which is a microtask after `start()` returns.
   */
  getRef: () => TheSeamGuideRef
  onClosed: (session: TheSeamGuideSession) => void
}
```

Add the imports:

```ts
import { TheSeamGuideRef } from './guide-ref'
import {
  TheSeamGuideContentContext,
  TheSeamGuideContentRenderer,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
} from './models/guide-content'
```

Add a slot-binding type above the class:

```ts
/**
 * One popover slot for one step.
 *
 * The host node is created once, when the guide starts, and handed to the
 * adapter for the guide's lifetime. Only the Angular view inside it comes and
 * goes. That is what lets driver.js rebuild its popover on every render — and
 * on the re-drive behind `refresh()` — while the view survives untouched.
 */
type SlotBinding =
  | { kind: 'text'; text: string }
  | {
      kind: 'view'
      slot: TheSeamGuideViewSlot
      host: HTMLElement
      view: TheSeamGuideContentView | null
    }

interface StepSlots {
  title: SlotBinding | null
  description: SlotBinding | null
}
```

Add fields and assign the new deps in the constructor:

```ts
  private readonly _contentRenderer: TheSeamGuideContentRenderer
  private readonly _getRef: () => TheSeamGuideRef
  private readonly _slots: StepSlots[] = []
```

```ts
    this._contentRenderer = deps.contentRenderer
    this._getRef = deps.getRef
```

In `start()`, build the bindings before handing steps to the adapter:

```ts
  start(): void {
    this._buildSlots()
    this._adapter.start(
      {
        steps: this.steps.map((step, index) => this._toAdapterStep(step, index)),
        allowUserDismiss: this.options.dismissible,
      },
      {
        onNextRequested: () => this.next(),
        onPreviousRequested: () => this.previous(),
        onCloseRequested: () => this.close('dismissed'),
      },
    )
    this._emit({ type: 'started' })
    this.moveTo(0)
  }
```

Add the slot methods:

```ts
  private _buildSlots(): void {
    for (const step of this.steps) {
      this._slots.push({
        title: this._bindSlot(step, 'title'),
        description: this._bindSlot(step, 'description'),
      })
    }
  }

  private _bindSlot(
    step: TheSeamGuideStep,
    name: 'title' | 'description',
  ): SlotBinding | null {
    const resolved = this._resolveSlot(step, name)
    if (resolved === null) {
      return null
    }
    if (resolved.kind === 'text') {
      return { kind: 'text', text: resolved.text }
    }
    return {
      kind: 'view',
      slot: resolved,
      host: document.createElement('div'),
      view: null,
    }
  }

  private _renderSlots(index: number): void {
    const slots = this._slots[index]
    if (slots === undefined) {
      return
    }
    for (const binding of [slots.title, slots.description]) {
      if (binding === null || binding.kind !== 'view' || binding.view !== null) {
        continue
      }
      binding.view = this._contentRenderer.render(
        binding.slot,
        this._contentContext(index, binding.slot),
        binding.host,
      )
    }
  }

  private _destroySlots(index: number): void {
    const slots = this._slots[index]
    if (slots === undefined) {
      return
    }
    for (const binding of [slots.title, slots.description]) {
      if (binding === null || binding.kind !== 'view' || binding.view === null) {
        continue
      }
      binding.view.destroy()
      binding.view = null
      binding.host.replaceChildren()
    }
  }

  private _destroyAllSlots(): void {
    for (let index = 0; index < this._slots.length; index++) {
      this._destroySlots(index)
    }
  }

  /** `data` is per slot, so the context is built per slot rather than per step. */
  private _contentContext(
    index: number,
    slot: TheSeamGuideViewSlot,
  ): TheSeamGuideContentContext {
    return {
      $implicit: slot.data,
      data: slot.data,
      text: slot.text,
      step: this.steps[index],
      index,
      total: this.steps.length,
      guide: this._getRef(),
    }
  }
```

Replace `_paint`:

```ts
  /** Paints a step that is actually entering: real target or elementless. */
  private _paint(index: number, step: TheSeamGuideStep): void {
    const outgoing = this._activeIndex()
    // Before `moveTo`: driver.js calls `onPopoverRender` synchronously from
    // there, so the host must already hold its view.
    this._renderSlots(index)
    this._activeIndex.set(index)
    this._afterStepFired = false
    this._beforeStepFiredFor = null
    this._adapter.moveTo(index)
    if (outgoing !== index) {
      this._destroySlots(outgoing)
    }
    this._emit({ type: 'stepChanged', index, step })
    this._onStepPainted(index, step)
  }
```

In `close()`, tear down the views after the adapter is destroyed:

```ts
    this._adapter.destroy()
    this._destroyAllSlots()
```

- [ ] **Step 6: Pass the host element through `_toAdapterStep`**

In `projects/ui-common/guide/guide-session.ts`, change `_toAdapterStep` and `_toAdapterPopover` to take the index and read the bindings instead of re-resolving:

```ts
  /** Element is a resolver function so the engine re-resolves at paint time. */
  protected _toAdapterStep(
    step: TheSeamGuideStep,
    index: number,
  ): TheSeamGuideAdapterStep {
    return {
      element:
        step.element === undefined
          ? undefined
          : () => this._resolveNow(step) ?? undefined,
      popover: this._toAdapterPopover(step, index),
    }
  }

  private _toAdapterPopover(
    step: TheSeamGuideStep,
    index: number,
  ): TheSeamGuideAdapterPopover | undefined {
    const slots = this._slots[index]
    const mapped: ExhaustiveMap<
      TheSeamGuidePopover,
      TheSeamGuideAdapterPopover
    > = {
      title: slotValue(slots?.title),
      description: slotValue(slots?.description),
      side: this._nearestScalar(step, 'side'),
      align: this._nearestScalar(step, 'align'),
    }

    return Object.values(mapped).every((value) => value === undefined)
      ? undefined
      : mapped
  }
```

Add this module-level function beside `stripUndefined`:

```ts
/** A text slot goes to the engine as a string; a view slot as its host node. */
function slotValue(
  binding: SlotBinding | null | undefined,
): string | HTMLElement | undefined {
  if (binding === null || binding === undefined) {
    return undefined
  }
  return binding.kind === 'text' ? binding.text : binding.host
}
```

- [ ] **Step 7: Supply the new deps from the service**

In `projects/ui-common/guide/guide.service.ts`, add the import and injected renderer:

```ts
import { TheSeamGuideDomContentRenderer } from './content/guide-content.renderer'
```

```ts
  private readonly _contentRenderer = inject(TheSeamGuideDomContentRenderer)
```

Then extend the session construction inside `start()`:

```ts
    const session = new TheSeamGuideSession(config, {
      adapter: this._adapter,
      registry: this._registry,
      contentRenderer: this._contentRenderer,
      popoverDefaults: this._popoverDefaults,
      getRef: () => ref,
      onClosed: () => this._clearIfCurrent(ref),
    })
```

- [ ] **Step 8: Update the two existing session spec helpers again**

In `guide-session.spec.ts` and `guide-session-recovery.spec.ts`, extend each `makeSession` to supply the two new deps. Add the imports `TheSeamGuideRef` from `'./guide-ref'` and `FakeGuideContentRenderer` from `'./testing/fake-guide-content.renderer'`, then:

```ts
  // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
  let ref: TheSeamGuideRef
  const session = new TheSeamGuideSession(config, {
    adapter,
    registry,
    contentRenderer: new FakeGuideContentRenderer(),
    popoverDefaults: {},
    getRef: () => ref,
    onClosed: () => {},
  })
  ref = new TheSeamGuideRef(session)
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx jest projects/ui-common/guide/guide-session-content.spec.ts` — expected: PASS, 14 tests.
Run: `npx jest projects/ui-common/guide` — expected: PASS, 949 tests / 115 suites.

- [ ] **Step 10: Verify both exhaustiveness guards actually fire**

Each hop keys `ExhaustiveMap` off its own source type, so the two guards are checked separately. Do not skip this — a guard that silently passes is worse than none, because the comment claims protection that is not there.

**Guard 1 — the session hop.** Temporarily add `foo?: string` to `TheSeamGuidePopover` in `models/guide-step.ts`, then run:

`npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json`

Expected: an error in `guide-session.ts` reporting `Property 'foo' is missing` in `_toAdapterPopover`. Remove `foo` again and re-run to confirm a clean build.

**Guard 2 — the driver.js hop.** Temporarily add `foo?: string` to `TheSeamGuideAdapterPopover` in `adapter/guide-adapter.ts`, then run the same command.

Expected: an error in `adapter/driver-js/driver-js-guide.adapter.ts` reporting `Property 'foo' is missing` in `_toDrivePopover`. Remove `foo` again and re-run to confirm a clean build.

If either guard does not fire, its `ExhaustiveMap` usage is wrong. The likely cause is a homomorphic mapped type — see the doc comment on `ExhaustiveMap` for why `keyof Src & string` and the conditional are both required.

- [ ] **Step 11: Lint, build, and commit**

Run: `npm run lint` — expected: 0 errors.
Run: `npm run build:ui-common` — expected: success.

```bash
git add projects/ui-common/guide/
git commit -m "feat(guide): accept template and component popover content"
```

---

### Task 6: Storybook proof against real driver.js

**Files:**
- Create: `projects/ui-common/guide/guide-content.stories.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: nothing consumed by later tasks.

**Why a separate stories file:** `guide.stories.ts` already calls `provideTheSeamGuide()` in its meta-level `applicationConfig`. These stories need a *different* provider configuration, and two `provideTheSeamGuide()` calls in one story tree would fight over the same tokens.

- [ ] **Step 1: Write the stories**

Create `projects/ui-common/guide/guide-content.stories.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core'
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import {
  TheSeamGuideContentContext,
  THE_SEAM_GUIDE_CONTENT,
} from './models/guide-content'
import { TheSeamGuideTargetDirective } from './target/guide-target.directive'

@Component({
  selector: 'seam-app-popover-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="d-flex align-items-center">
      <span aria-hidden="true" class="mr-2" data-testid="chrome-icon">{{
        _ctx.data['icon']
      }}</span>
      <strong data-testid="chrome-text">{{ _ctx.text }}</strong>
      <small class="ml-2 text-muted" data-testid="chrome-progress">
        {{ _ctx.index + 1 }}/{{ _ctx.total }}
      </small>
    </span>
  `,
})
class AppPopoverTitleComponent {
  readonly _ctx = inject(THE_SEAM_GUIDE_CONTENT)
}

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">
      <button
        type="button"
        class="btn btn-primary"
        seamGuideTarget="one"
        (click)="runChrome()"
      >
        Start chrome guide
      </button>

      <div class="mt-3 p-3 border" seamGuideTarget="two">A second target</div>

      <div class="mt-3">
        <button type="button" class="btn btn-primary" (click)="runTemplate()">
          Start template guide
        </button>
      </div>

      <ng-template #tpl let-d let-text="text" let-i="index" let-n="total">
        <div data-testid="tpl-body">
          <p>{{ text }}</p>
          <p data-testid="tpl-detail">{{ d['detail'] }} ({{ i + 1 }}/{{ n }})</p>
        </div>
      </ng-template>
    </div>
  `,
})
class GuideContentDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  readonly tpl = viewChild.required<TemplateRef<TheSeamGuideContentContext>>(
    'tpl',
  )

  /** Both steps supply only a string; the provider layer supplies the look. */
  runChrome(): void {
    this._guide.start({
      steps: [
        { element: 'one', popover: { title: 'Step One', description: 'One.' } },
        { element: 'two', popover: { title: 'Step Two', description: 'Two.' } },
      ],
    })
  }

  runTemplate(): void {
    this._guide.start({
      steps: [
        {
          element: 'one',
          popover: {
            title: 'Templated',
            description: {
              template: this.tpl(),
              text: 'Body from a template',
              data: { detail: 'with step data' },
            },
          },
        },
      ],
    })
  }
}

const meta: Meta<GuideContentDemoComponent> = {
  title: 'Guide/Guide Content',
  component: GuideContentDemoComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideTheSeamGuide({
          popover: {
            title: {
              component: AppPopoverTitleComponent,
              data: { icon: '★' },
            },
          },
        }),
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<GuideContentDemoComponent>

const titleEl = () =>
  document.querySelector<HTMLElement>('.driver-popover-title')
const descEl = () =>
  document.querySelector<HTMLElement>('.driver-popover-description')

export const ProviderChromeOnAStringStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start chrome guide' }),
    )

    await waitFor(() => expect(titleEl()).toBeTruthy())

    // Visibility, not just presence: driver.js hides a slot whose string is
    // falsy, and an element slot passes no string.
    await expect(titleEl()!.style.display).toBe('block')
    await expect(
      titleEl()!.querySelector('[data-testid="chrome-icon"]')?.textContent,
    ).toBe('★')
    await expect(
      titleEl()!.querySelector('[data-testid="chrome-text"]')?.textContent,
    ).toBe('Step One')
    await expect(
      titleEl()!
        .querySelector('[data-testid="chrome-progress"]')
        ?.textContent?.trim(),
    ).toBe('1/2')
    await expect(descEl()!.textContent).toBe('One.')
  },
}

export const ChromeSurvivesNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start chrome guide' }),
    )
    await waitFor(() => expect(titleEl()).toBeTruthy())

    await userEvent.click(
      document.querySelector<HTMLElement>('.driver-popover-next-btn')!,
    )

    await waitFor(() =>
      expect(
        titleEl()?.querySelector('[data-testid="chrome-text"]')?.textContent,
      ).toBe('Step Two'),
    )
    await expect(
      titleEl()!
        .querySelector('[data-testid="chrome-progress"]')
        ?.textContent?.trim(),
    ).toBe('2/2')
    // The dialog must keep an accessible name: driver.js points
    // aria-labelledby at the title element we just filled with a view.
    await expect(
      document.querySelector('.driver-popover')?.getAttribute('aria-labelledby'),
    ).toBe('driver-popover-title')
  },
}

export const TemplateDescription: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start template guide' }),
    )

    await waitFor(() =>
      expect(descEl()?.querySelector('[data-testid="tpl-body"]')).toBeTruthy(),
    )
    await expect(descEl()!.style.display).toBe('block')
    await expect(
      descEl()!.querySelector('[data-testid="tpl-detail"]')?.textContent,
    ).toBe('with step data (1/1)')
    // The step's own string still reaches the template as `text`.
    await expect(descEl()!.textContent).toContain('Body from a template')
  },
}
```

- [ ] **Step 2: Type-check the stories**

Run: `npx tsc --noEmit -p .storybook/tsconfig.json`

Expected: no errors. This is the **only** config that checks `.stories.ts` files — `tsconfig.stories.json` explicitly excludes them and CI never runs `test-storybook`, so a story can otherwise pass Jest, ESLint, and Prettier with real type errors in it.

- [ ] **Step 3: Run the story tests**

Ask the user before starting Storybook — it takes several minutes and they usually have it open already.

Run: `npm run storybook` (if not already running), then `npm run test-storybook -- guide`

Expected: all guide stories pass, including the six pre-existing ones in `guide.stories.ts`.

If the test runner cannot launch a browser: Playwright's install fails to extract under Node 24.16.0 on this machine. Switch to Node 22.12.0, run `npx playwright install`, then switch back. It must be **this project's** Playwright doing the install — a newer standalone Playwright lays down different build numbers.

- [ ] **Step 4: Full verification**

```bash
npx jest projects/ui-common/guide
npx tsc --noEmit -p .storybook/tsconfig.json
npm run lint
npm run build:ui-common
grep -rn "from 'driver\.js'" projects/ui-common/guide --include=*.ts
```

Expected: 949 tests / 115 suites pass; no type errors; 0 lint errors (48 pre-existing warnings); build succeeds; exactly one `driver.js` import.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/guide/guide-content.stories.ts
git commit -m "test(guide): prove popover content renders against real driver.js"
```

---

## Self-Review Notes

Checked against the spec's **Popover content** section:

| Spec requirement | Task |
| --- | --- |
| Three-arm content union with `never` guards | 1 |
| `data` shallow-merged provider → session → step | 1 |
| `text` nearest-wins; bare string is sugar | 1 |
| Slot presence rules 1–7 | 1 (resolver), 4 (session wiring) |
| `null` clears a session-supplied slot | 1, 4 |
| `title` and `description` both widen | 5 (model), 2 (adapter) |
| `side` / `align` layer nearest-wins | 4 |
| Provider layer via `provideTheSeamGuide({ popover })` | 4 |
| Template context, `$implicit` = data | 1, 3, 5 |
| Component gets DI, not `setInput` | 3 |
| `ApplicationRef.attachView`, not `ViewContainerRef` | 3 |
| Stable host node; view created on entry, destroyed on exit | 5 |
| View survives `refresh()` | 2 (adapter re-adopts), 5 (session does not re-render) |
| Adapter sees only `string \| HTMLElement` | 2 |
| `display: block` fix on filled slots | 2 |
| Exhaustive mapper at both hops | 2, 5, verified in 5 step 10 |
| Plain string costs no Angular view | 4, 5 (`slotValue`) |
| Renderer interface published, implementation not | 1, 3 |

**Known deliberate omissions**, all recorded in the spec's *Not in scope*: whole-popover content, nested content layers, deep-merged `data`, content as a function of the step context, and dropping an inherited renderer while keeping the slot.

**Test-count arithmetic** in each task's expected output assumes the baseline of 910 tests / 111 suites and that no earlier task's counts drifted. If a count is off but every test passes, update the running total rather than treating it as a failure.
