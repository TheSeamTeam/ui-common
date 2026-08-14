# Guide Module Design

**Date:** 2026-08-13
**Entry point:** `@theseam/ui-common/guide`
**Branch:** `marklb/guide`
**Status:** Approved design, pending implementation plan

## Purpose

An Angular feature for drawing a user's attention to elements on a page — both
multi-step walkthroughs and one-off highlights. The first implementation wraps
[driver.js](https://driverjs.com), but the engine is an implementation detail
hidden behind an adapter so it can be replaced (with a different library, or a
fully custom implementation) without consuming applications changing any code.

## Naming

The entry point is `guide`, and exported types use the `TheSeamGuide*` prefix.

`guide` was chosen over `spotlight`, `coach-marks`, and `walkthrough` because the
module must treat **elementless steps as first class**. driver.js supports a step
with no target — a centered popover with nothing highlighted — and that will be
used for explanatory steps in real walkthroughs. Names built on a highlighting
metaphor (`spotlight`, `coach-marks`) are wrong for that case, and `walkthrough`
implies multiple steps when single-element highlighting is an expected use.

`guide` is broad, which is its only real drawback. That is mitigated through
concrete identifiers (`TheSeamGuideService`, `seamGuideTarget`) rather than
through the import path.

## Requirements

1. Support both multi-step walkthroughs and single-element highlights.
2. Support steps with no target element.
3. The public API must be engine-agnostic. Replacing driver.js must not require
   refactoring consuming applications. Changes confined to this library are
   acceptable; changes rippling into apps are not.
4. Handle targets that are not in the DOM when the guide starts, and targets
   created or destroyed as the guide advances.
5. Support guides the user cannot dismiss.
6. Emit observable events sufficient for analytics to distinguish completion
   from abandonment.
7. Keyboard and screen-reader accessibility.

## Architecture

### Layout

```text
projects/ui-common/guide/
  ng-package.json
  public-api.ts
  guide.service.ts               TheSeamGuideService
  guide-ref.ts                   TheSeamGuideRef
  models/
    guide-config.ts              TheSeamGuideConfig, TheSeamGuideMissPolicy
    guide-step.ts                TheSeamGuideStep, TheSeamGuidePopover
    guide-event.ts               events, close reasons, TheSeamGuideBusyError
  target/
    guide-target.directive.ts    [seamGuideTarget]
    guide-target-registry.ts     name -> Element, with waitFor()
  adapter/
    guide-adapter.ts             TheSeamGuideAdapter + THE_SEAM_GUIDE_ADAPTER
    driver-js/
      driver-js-guide.adapter.ts the only file that imports 'driver.js'
  styles/
    _variables.scss
    _utilities.scss              no CSS output
  _guide-theme.scss
  testing/
    index.ts                     FakeGuideAdapter + CDK harness
  guide.stories.ts
  *.spec.ts
```

### Where the boundary sits

**The service owns sequencing; the adapter owns presentation.**

Everything worth preserving across an engine change lives in
`TheSeamGuideService` and is engine-agnostic: resolving targets, awaiting
`beforeStep`, timeout and miss policy, concurrency rules, and event emission.
The adapter only knows how to paint a step and report user intent.

```ts
export interface TheSeamGuideAdapter {
  start(config: TheSeamGuideAdapterConfig, callbacks: TheSeamGuideAdapterCallbacks): void
  next(): void
  previous(): void
  moveTo(index: number): void
  refresh(): void
  destroy(): void
  isActive(): boolean
}
```

Seven methods that any tour engine already has, keeping the adapter thin.

### Driving driver.js

driver.js can be driven two ways:

- Hand it one step at a time via `highlight()` — full control over async, but
  forfeits its built-in next/previous buttons, `1 of 5` progress indicator, and
  keyboard navigation, all of which would have to be rebuilt.
- Hand it the whole step array and intercept `onNextClick` / `onPrevClick` —
  the pattern driver.js documents for async work. Its migration notes state
  `preventMove()` was removed because "async support is now built-in".

**Decision: hand it the whole array and intercept.** It preserves driver.js's UI
and accessibility affordances instead of reimplementing them, and costs nothing
in genericness — the adapter interface is identical either way. Default advance
is suppressed, the async work runs, then `adapter.next()` is called once the
target is ready.

Each step's `element` is passed to driver.js as a **resolver function**, so it
re-resolves against the registry at paint time rather than against a reference
captured at `start()`.

Consequence: `beforeStep` hooks run on the service's clock, not driver.js's.
Nothing reaches the engine until its element is actually registered.

## Target resolution

### Registry

```ts
@Injectable({ providedIn: 'root' })
export class TheSeamGuideTargetRegistry {
  register(name: string, element: Element): void
  unregister(name: string, element: Element): void
  /** Currently registered, DOM-connected element, or null. */
  resolve(name: string): Element | null
  /** Emits as soon as the name resolves; errors on timeout. */
  waitFor(name: string, timeoutMs: number): Observable<Element>
}
```

Backed by `Map<string, Element[]>` plus a change subject. Two edge cases get
explicit policies:

- **Duplicate names registered simultaneously** — `resolve` returns the most
  recently registered connected element, and `isDevMode()` logs a warning naming
  the duplicate. Silently picking one is how a guide highlights the wrong row in
  a `@for` loop.
- **Re-registration mid-guide** — the directive unregisters on destroy and
  registers on init, so an element destroyed and recreated (route change, `@if`
  toggle) simply resolves again on the next `waitFor`.

The directive is thin: a `input.required<string>()` signal, register on init,
unregister on destroy, re-register when the name changes. It is standalone.

### Why a registry rather than raw selectors

A directive registering on init and unregistering on destroy lets the service
**await** a target's appearance. With raw CSS selectors the service would poll
the DOM blindly. Raw selectors and `Element` references remain supported for
simple cases, but named targets are what make the dynamic case tractable.

Relevant driver.js behavior: when a step's element is not found, driver.js does
not error — it silently renders the step as elementless. That failure mode is
unacceptable here, so **the service resolves targets before handing a step to
the adapter**.

## Step lifecycle

Every transition runs the same sequence, whether triggered by the user, the API,
or `start()`:

1. Await `afterStep` of the outgoing step.
2. Await `beforeStep` of the incoming step.
3. Resolve the target:
   - omitted -> elementless step
   - `Element` or selector -> direct resolution
   - registered name -> `waitFor(name, targetTimeout)`
4. On timeout, apply `onMissingTarget`.
5. `adapter.moveTo(index)` paints it.
6. Emit `stepChanged`.

### Miss policy

```ts
export type TheSeamGuideMissPolicy = 'skip' | 'elementless' | 'end'
```

- `'skip'` — continue in the direction of travel. If every remaining step
  misses, the guide ends rather than looping.
- `'elementless'` — show the popover centered (driver.js's natural fallback).
- `'end'` — close with reason `targetMissing`.

**Default `'skip'`**, configurable per guide with a per-step override. A guide
that quietly drops an unavailable step is better than one stranding the user on
a popover pointing at nothing.

A step carrying `onMissingTarget: 'end'` **is** a required step — if its target
never appears, the guide ends instead of continuing into steps that no longer
make sense. This is documented and demonstrated in the stories, since `'end'`
does not read as "required" at a call site.

**Every skip logs a warning under `isDevMode()`** naming the step and target, so
optional guides degrade gracefully in production while breakage still surfaces
during development.

**Not in scope:** grouped step dependencies (step 3 missing implies also skipping
4 and 5, resuming at 6). `'end'` covers the case that actually harms the user,
and `beforeStep` can call `ref.moveTo()` if a concrete need appears.

### Cancellation

Transitions must be cancellable. If the user presses Escape or clicks Previous
while step 4 is still awaiting its target, the pending wait must be abandoned or
it will paint a step after the guide is gone.

Transitions run through a request subject with `switchMap`, so a new transition
cancels the in-flight one, and teardown cancels unconditionally.

## Dismissal and concurrency

```ts
export interface TheSeamGuideConfig {
  steps: TheSeamGuideStep[]

  /** User may dismiss via Escape, overlay click, or close button. Default true. */
  dismissible?: boolean

  /** Milliseconds to wait for a target before the miss policy applies. Default 3000. */
  targetTimeout?: number

  /** Guide-level miss policy. Default 'skip'. */
  onMissingTarget?: TheSeamGuideMissPolicy
}

export interface TheSeamGuideStep {
  /** Registered target name, selector, or element. Omitted means elementless. */
  element?: string | Element | ElementRef

  popover?: TheSeamGuidePopover

  /** Overrides the guide-level value for this step. */
  targetTimeout?: number

  /** Overrides the guide-level policy. `'end'` marks this step required. */
  onMissingTarget?: TheSeamGuideMissPolicy

  beforeStep?: () => void | Promise<void> | Observable<unknown>
  afterStep?: () => void | Promise<void> | Observable<unknown>
}
```

Modeled on how important modals disable backdrop and Escape dismissal, requiring
an explicit button choice. Maps onto driver.js via `allowClose: false` (which
disables both Escape and overlay click) and omitting `'close'` from `showButtons`.

**`dismissible: false` blocks user dismissal, not programmatic dismissal.**
`ref.close()` always works — otherwise a guide could strand the application on
logout or a hard error.

### One active guide at a time

Two overlays would fight over the document, so concurrency is defined rather
than emergent. The rule is conditional on dismissibility:

- Active guide is **dismissible** -> `start()` supersedes it, closing the
  previous guide with reason `superseded`.
- Active guide is **not dismissible** -> `start()` throws
  `TheSeamGuideBusyError`. Silently superseding a guide deliberately marked
  unskippable would defeat the flag.

Throwing rather than queueing keeps the scheduling decision with the caller. The
active ref is therefore exposed so callers can queue themselves:

```ts
readonly activeGuide: Signal<TheSeamGuideRef | null>

_guide.activeGuide()?.afterClosed$.subscribe(() => _guide.start(myConfig))
```

**Dev-mode warning:** `dismissible: false` combined with
`onMissingTarget: 'skip'` logs a warning. A guide the user was forced through,
quietly dropping its content, is almost always a mistake. The defaults stay
orthogonal rather than implicitly coupled.

## Public API

```ts
export class TheSeamGuideRef {
  readonly events$: Observable<TheSeamGuideEvent>
  readonly afterClosed$: Observable<TheSeamGuideResult>  // single emission
  readonly activeIndex: Signal<number>
  next(): void
  previous(): void
  moveTo(index: number): void
  refresh(): void
  close(reason?: TheSeamGuideCloseReason): void
}
```

Events: `started`, `stepChanged`, `stepSkipped`, `closed`.
Close reasons: `completed`, `dismissed`, `targetMissing`, `superseded`,
`destroyed` — enough for analytics to distinguish "finished the guide" from
"abandoned on step 2".

### Exports

```ts
export * from './guide.service'
export * from './guide-ref'
export * from './target/guide-target.directive'
export * from './target/guide-target-registry'
export * from './models/guide-config'
export * from './models/guide-step'
export * from './models/guide-event'
export * from './adapter/guide-adapter'   // token + interface only
```

`driver-js-guide.adapter.ts` is **deliberately not exported**. It is wired by a
provider function so driver.js types never appear in a consumer's imports:

```ts
provideTheSeamGuide()                                // driver.js adapter (default)
provideTheSeamGuide({ adapter: MyCustomAdapter })    // swap, no consumer changes
```

### Popover content

v1 accepts **strings** for `title` and `description`. driver.js also accepts a
DOM node, so Angular `TemplateRef` support is feasible and the content type is
designed as a discriminated union from the start to admit it later without a
breaking change. Template rendering itself is deferred.

## Styling

The application performs one import:

```scss
@import '@theseam/ui-common/guide/styles/guide';
```

driver.js's stylesheet is pulled in by bare package path, the mechanism already
proven in `projects/ui-common/styles/theme.scss`:

```scss
@import 'driver.js/dist/driver';   // Sass resolves .css and inlines it
```

Structured like `breadcrumbs/`: `guide/styles/_variables.scss`,
`guide/styles/_utilities.scss` (variables, functions, and mixins only — no CSS
output), and `guide/_guide-theme.scss` layering Bootstrap 4.6 variables over
driver.js's defaults.

The guide styles depend only on Bootstrap variables and pull nothing from
`theme.scss`, so they cannot destabilize existing sheets.

**Explicit non-goal: `@use` migration.** This module uses `@import`, matching the
repository, which uses `@use` only for Sass built-in modules (`sass:color`,
`sass:map`). Bootstrap 4.6 still requires `@import`, and mixing the two systems
is where the sharp edges are. This module is not the place to begin that
migration.

## Testing

The Storybook a11y addon is **not** used for pass/fail. It is not strictly
followed in this repository today and may need configuration work, so
accessibility is asserted explicitly instead.

- **`testing/`** — a plain folder with `index.ts`, matching `buttons/testing/`
  (not a nested entry point). Ships `FakeGuideAdapter`, which drives the
  lifecycle with no DOM, plus a CDK harness.
- **Jest specs** — registry behavior (duplicate names, re-registration,
  `waitFor` timeout), transition sequencing, `switchMap` cancellation, each miss
  policy, and the supersede-versus-throw rule. All engine-free against
  `FakeGuideAdapter`, which is the payoff of the adapter boundary.
- **Storybook play functions** — against real driver.js: a multi-step
  walkthrough, an elementless step, a lazily rendered target, a non-dismissible
  guide, and keyboard navigation asserting focus lands in the popover and that
  Escape is inert when `dismissible: false`.

## Packaging

| File | Change |
| --- | --- |
| `package.json` (root) | add `driver.js` dependency |
| `projects/ui-common/package.json` | add `driver.js` to `dependencies` |
| `projects/ui-common/ng-package.json` | add `driver.js` to `allowedNonPeerDependencies`; add guide scss to `assets` |
| `projects/ui-common/guide/ng-package.json` | new: `{ "lib": { "entryFile": "public-api.ts" } }` |
| `projects/ui-common/jest.config.ts` | add `'**/guide/**/*.spec.ts'` to `testMatch` |

`driver.js` is a regular dependency plus `allowedNonPeerDependencies`, following
the existing precedent set by `quill` and `intl-tel-input`.

## Deferred

Out of scope for v1, with the `TheSeamGuideConfig` shape leaving room for each
without a breaking change:

- **Seen-state persistence** — remembering that a user already completed a guide.
- **Registered guide definitions** — a central registry of named guides that can
  be started by id.
- **Angular `TemplateRef` popover content** — the content type admits it; the
  rendering is not built.
- **Grouped step dependencies** — see Miss policy above.
