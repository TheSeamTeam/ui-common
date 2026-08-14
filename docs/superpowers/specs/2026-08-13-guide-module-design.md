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
5. Handle a target that disappears while its step is painted, whether permanently
   or temporarily, without re-firing step lifecycle hooks or emitting spurious
   step-transition events.
6. Support guides the user cannot dismiss.
7. Emit observable events sufficient for analytics to distinguish completion
   from abandonment.
8. Keyboard and screen-reader accessibility.

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
  guide-theme.scss              app-facing style entry (the only import an app needs)
  styles/
    _variables.scss
    _utilities.scss              no CSS output
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

## Mid-step target loss

Resolution at step entry is not sufficient. A target can leave the DOM while its
step is painted — destroyed permanently (a route change, a collapsed panel), or
temporarily (periodically refreshed data whose `trackBy` is missing or wrong, so
rows are destroyed and recreated on every refresh).

**Recovery is not a transition.** It reuses only the resolution step of the
lifecycle, never the full sequence. Re-running the sequence would re-fire
`beforeStep` and `afterStep` — which may open menus, navigate, or record
analytics — and would emit a second `stepChanged`, double-counting every step in
a funnel. Recovery must therefore be a distinct operation.

The existing architecture makes this cheap: each step's `element` is handed to
the adapter as a **resolver function**, so re-pointing is a single
`adapter.refresh()` call. The adapter re-resolves and repositions on whatever
element is registered at that moment.

> **Corrected 2026-08-14, during implementation.** This section previously
> claimed the adapter could implement `refresh()` by delegating to driver.js's
> own `refresh()`, on the assumption that doing so re-runs the step's `element`
> resolver. That assumption was wrong and was never verified when this spec was
> written. driver.js's `refresh()` repositions using its cached active element
> and never re-invokes the resolver, so a delegating implementation would keep
> highlighting the original — now detached — element, defeating this entire
> section. The driver.js adapter therefore implements `refresh()` by re-driving
> the currently active step index, which does re-invoke the resolver.
>
> The design is unchanged: the session still makes one `adapter.refresh()` call
> and recovery is still not a transition. Only the adapter's internal mechanism
> differs, and it stays behind the adapter boundary.

### Detection

Registry-based, at no additional cost: the target directive already calls
`unregister` in `ngOnDestroy`, so the disappearance of a **named** target is
known precisely and immediately.

**Selector and `Element` targets get no mid-step recovery in v1.** There is no
notification channel for them short of a `MutationObserver`, and this limitation
is a reason to prefer named targets. Documented explicitly rather than left to
be discovered.

### Sequence

1. Active step's target unregisters.
2. Emit `targetLost`. Enter `recovering` state; the popover stays on screen.
3. Start the `targetLostGrace` timer.
4. Target re-registers within grace -> `adapter.refresh()` re-points at the new
   element, emit `targetRecovered`. Invisible to the user.
5. Grace expires -> apply `onTargetLost`.

The element that re-registers may be a *different* element under the same name.
That is the intended behavior and is exactly what makes the `trackBy` churn case
recover cleanly.

### Policy and defaults

`onTargetLost` reuses the `'skip' | 'elementless' | 'end'` enum, but is a
**separate setting with a different default**, because what is graceful differs
by moment:

- At **entry**, the user has never seen the step, so `'skip'` is right.
- **Mid-step**, the user is actively reading the popover, so advancing is
  jarring. Default `'elementless'` collapses to a centered popover and keeps the
  content readable.

Permanent destruction does **not** throw. Mid-guide exceptions are hostile to the
user; an event is emitted and the policy decides. Applications wanting hard
failure set `onTargetLost: 'end'`.

### Interaction with cancellation

The grace timer runs through the same `switchMap` teardown as transitions, so a
user pressing Next, Previous, or Escape during recovery abandons the pending
recovery and the normal transition wins.

## Dismissal and concurrency

```ts
export interface TheSeamGuideConfig {
  steps: TheSeamGuideStep[]

  /** User may dismiss via Escape, overlay click, or close button. Default true. */
  dismissible?: boolean

  /** Milliseconds to wait for a target before the miss policy applies. Default 3000. */
  targetTimeout?: number

  /** Guide-level miss policy, applied at step entry. Default 'skip'. */
  onMissingTarget?: TheSeamGuideMissPolicy

  /**
   * Milliseconds to wait for a target to return after it disappears mid-step,
   * before `onTargetLost` applies. Default 1000.
   */
  targetLostGrace?: number

  /** Policy for a target lost mid-step. Default 'elementless'. */
  onTargetLost?: TheSeamGuideMissPolicy
}

export interface TheSeamGuideStep {
  /** Registered target name, selector, or element. Omitted means elementless. */
  element?: string | Element | ElementRef

  popover?: TheSeamGuidePopover

  /** Overrides the guide-level value for this step. */
  targetTimeout?: number

  /** Overrides the guide-level policy. `'end'` marks this step required. */
  onMissingTarget?: TheSeamGuideMissPolicy

  /** Overrides the guide-level mid-step loss policy. */
  onTargetLost?: TheSeamGuideMissPolicy

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

Events: `started`, `stepChanged`, `stepSkipped`, `targetLost`,
`targetRecovered`, `closed`.

`targetLost` and `targetRecovered` are deliberately distinct from `stepChanged`.
Mid-step recovery must never appear as a step transition, or analytics will
double-count.

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

**v1 accepts `string` only** for `title` and `description`. Nothing throws and no
unimplemented surface is published.

The eventual shape is a discriminated union covering both Angular content forms:

```ts
export type TheSeamGuideContent =
  | string
  | { template: TemplateRef<TheSeamGuideContentContext> }
  | { component: Type<unknown>; inputs?: Record<string, unknown> }
```

A `component` arm matters as much as `template`: a guide defined in a service
has no template declared anywhere, so `TemplateRef` alone would force awkward
plumbing on the most common caller.

Widening a parameter type is **not** a breaking change for callers, so both arms
can be added later with no consumer changes. What must be right in v1 is the
internal boundary, which is invisible to consumers:

```ts
// adapter sees only this, in v1 and after
popover?: { title?: string; description?: string | HTMLElement }
```

Both non-string arms will render identically — create the view through
`ViewContainerRef`, attach its `rootNodes` to a detached host element, hand the
adapter that `HTMLElement`, and destroy the view on step exit. **The service
performs all Angular work; the adapter only ever receives a string or a DOM
node**, which is what keeps the adapter engine-agnostic.

`TheSeamDynamicComponentLoader` (`@theseam/ui-common/dynamic-component-loader`)
is **not** reused here. It resolves lazily loaded components by string id through
the deprecated `NgModuleFactory` / `ComponentFactory` APIs — a different problem
from rendering an already-known component into a host node.

## Styling

The application performs one import, matching the `breadcrumbs` precedent:

```scss
@import '@theseam/ui-common/guide/guide-theme';
```

### File roles

Structured exactly like `breadcrumbs/`:

| File | Role |
| --- | --- |
| `guide/guide-theme.scss` | App-facing entry. The only file an app imports. |
| `guide/styles/_utilities.scss` | Imports `../../styles/utilities` and `./variables`. No CSS output. |
| `guide/styles/_variables.scss` | Guide-specific variables. |

**No leading underscore on `guide-theme.scss`**, deliberately diverging from
`breadcrumbs/_breadcrumbs-theme.scss`. An underscore marks a Sass partial —
a file never compiled on its own. This one *is* compiled on its own, because
Storybook lists it in the `styles` array (see below). The consumer-facing import
resolves identically either way, so nothing is lost.

`guide-theme.scss` pulls driver.js's stylesheet in by bare package path — the
mechanism already proven in `projects/ui-common/styles/theme.scss`, which
imports `@angular/cdk/overlay-prebuilt` and
`overlayscrollbars/css/OverlayScrollbars.min` the same way:

```scss
@import './styles/utilities';
@import 'driver.js/dist/driver.css';   // see the correction note below
// ... Bootstrap 4.6 variables layered over driver.js defaults
```

The guide styles import the global **`styles/utilities`** (variables, functions,
and mixins only, no CSS output) and never `theme.scss`, so they cannot duplicate
rules or destabilize existing sheets.

> **Corrected 2026-08-14, during implementation.** Two errors in the original
> text, both of which shipped a working-looking stylesheet that could not
> compile.
>
> **The specifier needs its `.css` extension.** driver.js's `package.json`
> `exports` map publishes only `./dist/driver.css`, so the extensionless form is
> unresolvable by any exports-aware resolver — Storybook's sass-loader failed
> with "Can't find stylesheet to import". The two precedents cited above are
> both special cases that hide this: `@angular/cdk` deliberately publishes
> *both* `./overlay-prebuilt.css` and `./overlay-prebuilt`, and
> `overlayscrollbars` has no `exports` map at all. Neither generalises.
>
> **Sass does not inline it.** Because the specifier ends in `.css`, Sass emits
> a plain CSS `@import` verbatim and leaves resolution to whatever bundles the
> emitted CSS afterwards. Storybook works because webpack's css-loader resolves
> it at that later stage; esbuild resolves and inlines it for consuming apps.
> The end result is equivalent, but the mechanism is not what this section
> originally claimed.
>
> Root cause of both: the build verification below was structurally incapable of
> catching them. `npm run build:ui-common` passes because ng-packagr *copies*
> `**/*.scss` as assets without ever compiling them, and a standalone Dart Sass
> check passes because plain Dart Sass probes the filesystem and ignores
> `exports` maps. Neither exercises the resolver that actually matters.

### Build asset entry

The stylesheets have no component to be inlined into, so ng-packagr will not
include them unless they are declared as assets. **`projects/ui-common/ng-package.json`**
needs one entry:

```json
{ "glob": "**/*.scss", "input": "guide", "output": "guide" }
```

This copies `guide-theme.scss` and everything under `guide/styles/` into
`dist/ui-common/guide/`, matching the existing `breadcrumbs` entry.

> **Do not** add a matching entry to the `assets` array in
> `projects/ui-common/package.json`. That array is **dead config** — the build
> target in `angular.json` uses `@angular/build:ng-packagr` pointed at
> `projects/ui-common/ng-package.json`, and `package.json` has no `ngPackage`
> key, so ng-packagr never reads it. Its entries also use inconsistent input
> paths, which is further evidence it is vestigial. Cleaning it up is out of
> scope for this work, but nothing new should be added to it.

### Storybook

Every other module's styles reach Storybook implicitly, through a component's
own `.scss`. **The guide has no component** — driver.js injects its overlay and
popover outside Angular — so its styles reach Storybook only if loaded globally.
Without this, the module is developed against unstyled driver.js defaults.

`angular.json` needs the theme added to the `styles` array of **both** the
`storybook` and `build-storybook` targets:

```json
"styles": [
  "projects/ui-common/styles/theme.scss",
  "projects/ui-common/framework/route-transitions/route-transitions.css",
  "node_modules/@marklb/ngx-datatable/assets/icons.css",
  "projects/ui-common/guide/guide-theme.scss"
]
```

Add to the `assets` array of both targets as well, for parity with the published
layout. Note these use repo-relative inputs, unlike `ng-package.json`:

```json
{ "glob": "**/*.scss", "input": "projects/ui-common/guide", "output": "guide" }
```

The theme is **not** added to `projects/ui-common/styles/theme.scss`. That file
is the app-level global, and importing the guide there would force its styles on
every application, defeating the opt-in design.

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
- **Jest specs, mid-step loss** — called out separately because these are the
  regressions that would be silent:
  - target lost then recovered within grace emits `targetLost` and
    `targetRecovered`, and **asserts `beforeStep` and `afterStep` were not
    re-invoked and no `stepChanged` was emitted**
  - recovery re-points at a *different* element registered under the same name
  - grace expiry applies each `onTargetLost` policy
  - Next/Previous/Escape during grace abandons the pending recovery
- **Storybook play functions** — against real driver.js: a multi-step
  walkthrough, an elementless step, a lazily rendered target, a target destroyed
  and recreated mid-step, a non-dismissible guide, and keyboard navigation
  asserting focus lands in the popover and that Escape is inert when
  `dismissible: false`.

## Packaging

| File | Change |
| --- | --- |
| `package.json` (root) | add `driver.js` dependency |
| `projects/ui-common/package.json` | add `driver.js` to `dependencies` |
| `projects/ui-common/ng-package.json` | add `driver.js` to `allowedNonPeerDependencies`; add `{ "glob": "**/*.scss", "input": "guide", "output": "guide" }` to `assets` |
| `angular.json` | add `guide-theme.scss` to `styles` **and** a guide `assets` entry, in **both** the `storybook` and `build-storybook` targets |
| `projects/ui-common/guide/ng-package.json` | new: `{ "lib": { "entryFile": "public-api.ts" } }` |
| `projects/ui-common/jest.config.ts` | add `'**/guide/**/*.spec.ts'` to `testMatch` |

`driver.js` is a regular dependency plus `allowedNonPeerDependencies`, following
the existing precedent set by `quill` and `intl-tel-input`.

### Build verification

Because a missing asset entry fails silently — the package builds and publishes,
and only a consuming application discovers the stylesheet is absent — the
implementation must verify against real build output rather than assume:

1. `npm run build:ui-common`
2. Confirm `dist/ui-common/guide/guide-theme.scss` and
   `dist/ui-common/guide/styles/` exist.
3. Confirm `@import '@theseam/ui-common/guide/guide-theme'` compiles from a
   consumer, which also proves the bare-package `driver.js/dist/driver` import
   resolves through the published package rather than only in this repository.
4. Confirm the guide overlay renders **styled** in Storybook, not with driver.js
   defaults — the visible signal that the `angular.json` `styles` entry took
   effect.

## Deferred

Out of scope for v1, with the `TheSeamGuideConfig` shape leaving room for each
without a breaking change:

- **Seen-state persistence** — remembering that a user already completed a guide.
- **Registered guide definitions** — a central registry of named guides that can
  be started by id.
- **`TemplateRef` and standalone-component popover content** — v1 ships `string`;
  widening the type later is non-breaking, and the adapter boundary already
  accepts an `HTMLElement`.
- **Mid-step recovery for selector and `Element` targets** — would require a
  `MutationObserver` active for the duration of a guide. Named targets cover it
  today via the registry.
- **Grouped step dependencies** — see Miss policy above.
