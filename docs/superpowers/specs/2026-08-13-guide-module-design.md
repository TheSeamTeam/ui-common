# Guide Module Design

**Date:** 2026-08-13
**Entry point:** `@theseam/ui-common/guide`
**Branch:** `marklb/guide`
**Status:** Implemented. **Popover content** was revised 2026-08-17 and
implemented against that revision; see
`docs/superpowers/plans/2026-08-17-guide-popover-content.md`.

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
  guide-session.ts               TheSeamGuideSession — sequencing and slot lifecycle
  guide-providers.ts             provideTheSeamGuide + popover defaults token
  models/
    guide-config.ts              TheSeamGuideConfig, TheSeamGuideMissPolicy
    guide-step.ts                TheSeamGuideStep, TheSeamGuidePopover
    guide-event.ts               events and close reasons
    guide-errors.ts              TheSeamGuideBusyError
    guide-content.ts             content union, context, DI token, renderer interface
    exhaustive-map.ts            makes a dropped popover field a compile error
  content/
    guide-content-resolver.ts    pure three-layer slot resolution
    guide-content.renderer.ts    the only file touching ApplicationRef
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
    index.ts                     barrel
    fake-guide.adapter.ts        FakeGuideAdapter
    fake-guide-content.renderer.ts  FakeGuideContentRenderer
  guide.stories.ts
  guide-content.stories.ts
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

  /**
   * Popover defaults for every step in this guide. The middle of the three
   * content layers — see Popover content below.
   */
  popover?: TheSeamGuidePopover
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
export * from './models/guide-content'    // content union, context, DI token
export * from './adapter/guide-adapter'   // token + interface only
```

`driver-js-guide.adapter.ts` is **deliberately not exported**. It is wired by a
provider function so driver.js types never appear in a consumer's imports:

```ts
provideTheSeamGuide()                                // driver.js adapter (default)
provideTheSeamGuide({ adapter: MyCustomAdapter })    // swap, no consumer changes
provideTheSeamGuide({ popover: { … } })              // application-wide look
```

`TheSeamGuideContentRenderer` is internal. It is a separate `providedIn: 'root'`
service rather than logic inside the session so that session specs can run
against a fake renderer, keeping them free of a real `ApplicationRef`.

### Popover content

> **Revised 2026-08-17.** v1 shipped `string` only, and this section previously
> described a three-arm union (`string | {template} | {component}`) as the
> eventual shape, with `title` staying `string` forever. Both were wrong. The
> union had nowhere to put per-step data, so a renderer shared across steps
> could not vary its content; and a title that must carry an icon, a subtitle,
> and a progress indicator cannot be a string. The section below replaces the
> original in full. The **adapter boundary is unchanged** apart from `title`
> widening to match `description`, so the v1 groundwork holds.

`title` and `description` each accept a string, a `TemplateRef`, or a standalone
component. A `component` arm matters as much as `template`: a guide defined in a
service has no template declared anywhere, so `TemplateRef` alone would force
awkward plumbing on the most common caller.

```ts
export interface TheSeamGuidePopover {
  /** `null` opts a step out of a slot its session layer supplies. */
  title?: TheSeamGuideContent | null
  description?: TheSeamGuideContent | null
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}
```

Widening a parameter type is **not** a breaking change for callers, so this is a
minor release.

`null` exists for exactly one case, and it is narrow. Omitting a slot at the
step layer already excludes it — *unless the session layer supplies one*, since
omission means "inherit". A guide that sets a default title for all its steps
would otherwise force that title onto every step:

```ts
this._guide.start({
  popover: { title: { component: AppPopoverTitle } },
  steps: [
    { popover: { description: 'Step one.' } },               // title renders
    { popover: { title: null, description: 'Step two.' } },  // no title
  ],
})
```

`null` is never needed against the **provider** layer, which cannot create a
slot at all — see Slot presence below.

#### Two axes: renderer and data

The hard part is not the union, it is that an application wants one popover
*look* across every guide while each step supplies its own *content*. It is
tempting to model that as layers of nested content — an app-level component
wrapping a step-level one. That model fails: nothing in the config distinguishes
"fill this chrome" from "replace this chrome", content projection is
one-directional so an inner layer can never adjust the outer's padding, and the
question of which layer owns the navigation buttons has no good answer.

So the two concerns are separated instead:

- **Renderer** (`template` or `component`) — resolved **nearest-wins**: step,
  else session, else provider.
- **Data** — **shallow-merged** across all three layers, step last.
- **Text** (`text`) — the slot's plain text, resolved nearest-wins like the
  renderer. A bare string is sugar for `{ text: '…' }`.

```ts
export type TheSeamGuideContentData = Record<string, unknown>

export interface TheSeamGuideContentBase {
  /** The slot's plain text. A bare string is sugar for this. Nearest-wins. */
  text?: string
  /** Application-defined. Shallow-merged provider -> session -> step. */
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

/** Text and/or data for whichever renderer a lower layer supplies. */
export interface TheSeamGuideInheritedContent extends TheSeamGuideContentBase {
  template?: never
  component?: never
}

export type TheSeamGuideContentSpec =
  | TheSeamGuideTemplateContent
  | TheSeamGuideComponentContent
  | TheSeamGuideInheritedContent

export type TheSeamGuideContent = string | TheSeamGuideContentSpec
```

The `never` guards make `template` and `component` on one object a **compile
error** rather than a runtime precedence rule nobody remembers.

`data` has **no reserved keys**. That is why `text` is a sibling field rather
than a well-known key inside the bag: an application can name its own data
whatever it likes without colliding with the library. For the same reason `data`
is never spread — it stays one object, so a template's `let-index` is
unambiguously the step index and never an application value.

#### Three layers

```ts
provideTheSeamGuide({ popover: { … } })   // application-wide default look
TheSeamGuideConfig.popover                 // defaults for one guide
TheSeamGuideStep.popover                   // one step
```

All three are a `TheSeamGuidePopover`, so `side` and `align` layer too, by the
same nearest-wins rule as the renderer.

The provider layer exists because look-and-feel limitations are the ones
applications route around. An application that has already written its guides
and then needs an icon in every popover title — something CSS alone cannot do —
changes one provider call rather than every step.

Worked example:

```ts
provideTheSeamGuide({
  popover: {
    title: { component: AppPopoverTitle, data: { icon: AppStepIcon } },
  },
})

this._guide.start({
  steps: [
    { popover: { title: 'Step One', description: 'Example one.' } },
    {
      popover: {
        title: {
          component: StepPopoverTitle,
          data: { icon: StepTwoIcon, label: 'Step Two' },
        },
        description: 'Example two.',
      },
    },
    {
      popover: {
        title: { template: tplRef, data: { label: 'Step Three' } },
        description: 'Example three.',
      },
    },
    {
      popover: {
        title: { text: 'Step Four', data: { icon: StepFourIcon } },
        description: 'Example four.',
      },
    },
  ],
})
```

| Step | Renderer | `text` | `data` |
| --- | --- | --- | --- |
| 1 | `AppPopoverTitle` (provider) | `'Step One'` | `{ icon: AppStepIcon }` |
| 2 | `StepPopoverTitle` (step) | — | `{ icon: StepTwoIcon, label: 'Step Two' }` |
| 3 | `tplRef` (step) | — | `{ icon: AppStepIcon, label: 'Step Three' }` |
| 4 | `AppPopoverTitle` (provider) | `'Step Four'` | `{ icon: StepFourIcon }` |

Step 2 replaces the application's title chrome outright, which is what its name
implies. An application that instead wants its own frame around a per-step piece
composes that **inside its own component** — put a `Type` or `TemplateRef` in
`data` and project it with `NgComponentOutlet` or `ngTemplateOutlet`. The
application then controls the nesting, the padding, and the depth, none of which
the library could have got right on its behalf.

#### Slot presence

**A slot renders only if the session or step layer supplies it.** Provider
config decorates slots that exist; it never conjures a title onto a step that
asked only for a description. This preserves driver.js's existing behavior — an
absent title is a hidden title — and keeps the common `{ description: '…' }`
step from silently growing chrome.

Resolution order for one slot, given the three layers:

1. **Presence.** Take the step layer if it mentions the slot, else the session
   layer if it does. If neither does, or the one taken is `null`, the slot is
   absent — stop.
2. **Renderer** is the nearest `template` or `component`, searching step, then
   session, then provider.
3. **`text`** is the nearest `text`, searched the same way.
4. **`data`** is the shallow merge of every layer's `data`, step last.
5. No renderer and no `text` — absent.
6. No renderer, but `text` — pass `text` to the adapter as a plain string,
   exactly as in v1. **No Angular view is created, so the common case costs
   nothing.**
7. Otherwise render the renderer with the resolved context.

Only rule 1 consults presence; rules 2–4 consult all three layers regardless of
which one made the slot present. That is what lets step 1 of the worked example
say `title: 'Step One'` and get the provider's component.

`null` is therefore only meaningful at the step layer. At the session layer it
is indistinguishable from omission, and at the provider layer it does nothing,
since neither can make a slot present. The type permits it everywhere because
all three layers share `TheSeamGuidePopover`; it is simply inert.

#### How content receives its data

Templates get a context; components get DI. Both carry the same values.

```ts
export interface TheSeamGuideContentContext {
  $implicit: TheSeamGuideContentData   // === data, so `let-d` reads `d.icon`
  data: TheSeamGuideContentData
  text: string | undefined
  step: TheSeamGuideStep
  index: number
  total: number
  guide: TheSeamGuideRef
}

export const THE_SEAM_GUIDE_CONTENT =
  new InjectionToken<TheSeamGuideContentContext>('THE_SEAM_GUIDE_CONTENT')
```

A component reads `inject(THE_SEAM_GUIDE_CONTENT)` for its data and
`inject(TheSeamGuideRef)` to drive navigation — the ref is provided on the
content component's element injector. This matches the `data`-plus-injector
convention the modal components already use.

**`ComponentRef.setInput` is deliberately not used.** It throws `NG0303` in dev
mode for any name the component does not declare as an input, and merging
guarantees extra keys: provider-level `data.icon` reaches step 2, whose
`StepPopoverTitle` need not declare `icon`. Per-key input binding and layered
defaults are fundamentally incompatible. One opaque bag is also what lets a
renderer ignore data meant for a different renderer.

#### Rendering mechanism

The **service side performs all Angular work; the adapter only ever receives a
string or a DOM node**, which is what keeps the adapter engine-agnostic.

A `TheSeamGuideContentRenderer` (`providedIn: 'root'`) owns it, rather than
`TheSeamGuideSession`, which is already large and otherwise free of Angular
rendering concerns. It returns `{ host: HTMLElement; destroy(): void }`.

- **template** — `template.createEmbeddedView(context)`, `appRef.attachView`,
  append `rootNodes` to the host.
- **component** — `createComponent(type, { environmentInjector, elementInjector })`,
  `appRef.attachView(ref.hostView)`, append `ref.location.nativeElement`.

> The original text said "create the view through `ViewContainerRef`". There is
> no `ViewContainerRef` to reach from a `providedIn: 'root'` service.
> `ApplicationRef.attachView` is the correct equivalent and gives the same
> result: a change-detected view whose root nodes live wherever we put them.

`TheSeamDynamicComponentLoader` (`@theseam/ui-common/dynamic-component-loader`)
is **not** reused here. It resolves lazily loaded components by string id through
the deprecated `NgModuleFactory` / `ComponentFactory` APIs — a different problem
from rendering an already-known component into a host node.

#### Lifecycle, and surviving mid-step recovery

The session creates **one stable, empty host element per rendered slot** when the
guide starts, and hands those to the adapter. Angular views are created into the
host on step entry — before `adapter.moveTo` — and destroyed on step exit;
`close()` destroys whatever is still live.

driver.js tears down and rebuilds its **entire popover DOM on every render**,
including the re-drive that implements `refresh()`. Because the host element is
owned by the session and merely re-adopted by `onPopoverRender` each time, the
Angular view is never re-created. Mid-step recovery therefore preserves content
state — a scroll position, a typed-in value, an in-flight animation — instead of
resetting it, and the invisible recoveries stay invisible.

#### The adapter boundary

Unchanged from v1 except that `title` widens to match `description`:

```ts
popover?: {
  title?: string | HTMLElement
  description?: string | HTMLElement
  side?: …
  align?: …
}
```

> **The v1 `HTMLElement` branch was untested and did not work.** driver.js sets
> `element.style.display = 'none'` whenever a slot's string is falsy, and the
> adapter passed `description: undefined` for the element case — so the node was
> appended into a hidden container. `onPopoverRender` must set
> `display = 'block'` on any slot it fills. This applies to both slots.

**Popover fields are enumerated by hand at two hops** — `_toAdapterStep` in the
session and `_toDriveStep` in the driver.js adapter — because a wholesale spread
once let `side` and `align` be silently dropped (TypeScript exempts spread
properties from excess-property checking). A single shared mapper is not
possible; the two hops map between different shapes. Instead each mapper's
target is annotated with a mapped type that strips optionality:

```ts
const popover: {
  [K in keyof TheSeamGuidePopover]-?: TheSeamGuideAdapterPopover[K] | undefined
} = { … }
```

Every key must then be present in the literal, so **adding a field to
`TheSeamGuidePopover` is a compile error at both hops** until it is carried
through.

#### What driver.js still owns

Filling the two slots does not touch navigation. driver.js builds the popover as
`wrapper > [title, description, footer[progress, previous, next, close], arrow]`;
the footer is a sibling of both slots and its visibility comes from
`showButtons`, which the adapter drives from `allowUserDismiss`.

Two consequences worth knowing:

- driver.js focuses the first focusable node in the popover, so an interactive
  element in content takes initial focus instead of Next. Asserted in a story,
  not prevented.
- `aria-labelledby` points at the title element, so title content becomes the
  dialog's accessible name. Decorative icons and progress indicators belong
  behind `aria-hidden`.

**Strings are inserted as HTML.** driver.js assigns a string slot with
`innerHTML`. That is pre-existing v1 behavior and is not changed here, but it
means a string is the wrong arm for untrusted content — `template` and
`component` are the safe ones.

#### Not in scope

- **Whole-popover content.** `onPopoverRender` hands us the entire `PopoverDOM`,
  so a slot that replaces the wrapper's children is mechanically easy and is the
  right home for relocated buttons, custom progress indicators, and popover
  padding. It also makes the application responsible for navigation UI and
  keyboard accessibility that driver.js currently handles. Purely additive later
  — one field on `TheSeamGuidePopover` — and deferred until a real consumer
  needs it.
- **Nested content layers.** Rejected above; applications compose inside their
  own components instead.
- **Deep-merging `data`.** Shallow only. A deep merge makes it impossible to
  replace a nested object at a nearer layer.
- **Content as a function of the step context.** A slot could accept
  `(ctx: { step, index, total, guide }) => TheSeamGuideContentValue | null`,
  evaluated at step entry, covering index-dependent text and conditionally
  chosen renderers without writing a component. Deferred until real use shows it
  is needed: a caller can interpolate the strings while building the steps array
  today, and the cost is not free — any slot with a function in any layer stops
  being statically resolvable at `start()`, so it must be allocated a host
  element, losing the plain-string path that keeps the common case free of
  Angular entirely.
- **Dropping an inherited renderer while keeping the slot.** `null` clears a
  whole slot, but nothing expresses "a plain string here, not the application's
  title component". Additive later, in several possible shapes — a `'none'`
  sentinel on the spec object being the obvious one — and deliberately not
  invented before a consumer needs it, since it would introduce a second
  null-like concept alongside slot-clearing `null`.

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
- **Jest specs, popover content** — layer resolution is a pure function and is
  tested as one: renderer precedence across all three layers, shallow data
  merge order, `text` sugar and precedence, the slot-presence rule, and the
  no-renderer path staying a plain string. Separately, the renderer's two arms,
  the context and DI values each receives, and that `destroy()` detaches from
  `ApplicationRef`. Against `FakeGuideAdapter`: the host element reaching the
  adapter, views created on entry and destroyed on exit, `refresh()` **not**
  re-creating the view, and `close()` destroying live views.
- **Storybook play functions, popover content** — provider-level default chrome
  applied to a plain-string step, a per-step component override, and a template
  slot. These assert the content is **visible** inside `.driver-popover-title`
  and `.driver-popover-description` — a check no Jest spec can make, and the one
  that would have caught the `display: none` defect above — plus that navigation
  still works and the dialog keeps an accessible name.

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
- **Whole-popover content** — see Popover content above. The two slots cover
  everything except relocated navigation, custom progress indicators, and
  popover padding.
- **Mid-step recovery for selector and `Element` targets** — would require a
  `MutationObserver` active for the duration of a guide. Named targets cover it
  today via the registry.
- **Grouped step dependencies** — see Miss policy above.
