# Guide Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `@theseam/ui-common/guide` secondary entry point that highlights elements and runs multi-step walkthroughs, wrapping driver.js behind a swappable adapter.

**Architecture:** The service owns sequencing (target resolution, lifecycle hooks, miss policy, concurrency, events) and is engine-agnostic. The adapter owns presentation and is the only code that knows driver.js exists. A target registry, fed by a directive that registers on init and unregisters on destroy, lets the service await elements that do not exist yet and recover from ones that disappear mid-step.

**Tech Stack:** Angular 20 (standalone, signals, `inject()`), RxJS 7.8, driver.js, ng-packagr, Jest + Spectator, Storybook 9 (CSF 3), Sass with `@import`, Bootstrap 4.6.

**Spec:** [docs/superpowers/specs/2026-08-13-guide-module-design.md](../specs/2026-08-13-guide-module-design.md)

## Global Constraints

- **Naming:** everything exported through `public-api.ts` uses the `TheSeam` prefix. Component selectors `seam-` kebab-case; directive selectors `seam` camelCase. Never prefix interfaces with `I`.
- **Private members:** prefix with `_` (e.g. `private _count = 0`). Injected members are `readonly` and use `inject()`, not constructor injection.
- **Change detection:** `ChangeDetectionStrategy.OnPush` on any component.
- **Standalone:** new code is standalone; no NgModule for this module.
- **Prettier:** 2-space indent, **no semicolons**, single quotes, trailing commas, arrow parens always. All code below is already in this style — preserve it.
- **Sass:** `@import` only. Do **not** introduce `@use` for files (`@use` is reserved for Sass built-ins like `sass:color`). Bootstrap 4.6 requires this.
- **Adapter isolation:** `driver.js` may be imported in exactly one file, `adapter/driver-js/driver-js-guide.adapter.ts`. It must never appear in `public-api.ts` or in any type a consumer can reach.
- **Defaults (exact values):** `dismissible: true`, `targetTimeout: 3000`, `onMissingTarget: 'skip'`, `targetLostGrace: 1000`, `onTargetLost: 'elementless'`.
- **Commands:** run a single spec with `npx jest <path>` from the repo root. Full suite: `npm run test:ci`. Lint: `npm run lint`. Build: `npm run build:ui-common`.
- **Commits:** conventional commits. The PR title becomes the squashed commit, so use `feat(guide): ...` for the feature work.

## Deviations from the spec (deliberate, already reasoned)

These are refinements made while planning. They do not change any approved behavior.

1. **`models/guide-errors.ts` added.** The spec put `TheSeamGuideBusyError` in `guide-event.ts`. Errors are not events, and a second error type (`TheSeamGuideTargetTimeoutError`) is needed, so both live in their own file.
2. **`guide-session.ts` added.** The spec implied one `guide.service.ts`. The per-guide state machine (transitions, resolution, recovery) is large enough that keeping it with the service's concurrency logic would produce one oversized file. The service owns concurrency and creates sessions; the session owns one guide's lifecycle.
3. **String `element` resolution order is now explicit.** The spec allows `element` to be a registered name *or* a CSS selector, both strings, without saying which wins. **Rule: registry first, then `document.querySelector`.** Named targets are the preferred path per the spec, so they take precedence. Only registry-resolved targets get mid-step recovery.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `projects/ui-common/guide/ng-package.json` | ng-packagr secondary entry point config |
| `projects/ui-common/guide/public-api.ts` | Explicit public exports |
| `projects/ui-common/guide/models/guide-step.ts` | `TheSeamGuideStep`, `TheSeamGuidePopover`, `TheSeamGuideMissPolicy` |
| `projects/ui-common/guide/models/guide-config.ts` | `TheSeamGuideConfig`, `THE_SEAM_GUIDE_DEFAULTS` |
| `projects/ui-common/guide/models/guide-event.ts` | `TheSeamGuideEvent`, `TheSeamGuideResult`, close reasons |
| `projects/ui-common/guide/models/guide-errors.ts` | `TheSeamGuideBusyError`, `TheSeamGuideTargetTimeoutError` |
| `projects/ui-common/guide/target/guide-target-registry.ts` | name → elements, `resolve`, `waitFor`, change stream |
| `projects/ui-common/guide/target/guide-target.directive.ts` | `[seamGuideTarget]`, registers/unregisters |
| `projects/ui-common/guide/adapter/guide-adapter.ts` | Adapter interface, config/callback types, DI token |
| `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts` | The only file importing `driver.js` |
| `projects/ui-common/guide/guide-session.ts` | One guide's state machine: transitions, resolution, recovery |
| `projects/ui-common/guide/guide-ref.ts` | Consumer-facing handle to a running guide |
| `projects/ui-common/guide/guide.service.ts` | Entry point, concurrency rules, `provideTheSeamGuide` |
| `projects/ui-common/guide/testing/fake-guide.adapter.ts` | Engine-free adapter for specs |
| `projects/ui-common/guide/testing/index.ts` | Barrel for the testing folder |
| `projects/ui-common/guide/guide-theme.scss` | App-facing style entry |
| `projects/ui-common/guide/styles/_variables.scss` | Guide variables |
| `projects/ui-common/guide/styles/_utilities.scss` | Imports global utilities + variables, no CSS output |
| `projects/ui-common/guide/guide.stories.ts` | CSF 3 stories with play functions |

---

## Task 1: Entry point scaffold and models

**Files:**
- Create: `projects/ui-common/guide/ng-package.json`
- Create: `projects/ui-common/guide/public-api.ts`
- Create: `projects/ui-common/guide/models/guide-step.ts`
- Create: `projects/ui-common/guide/models/guide-config.ts`
- Create: `projects/ui-common/guide/models/guide-event.ts`
- Create: `projects/ui-common/guide/models/guide-errors.ts`
- Test: `projects/ui-common/guide/models/guide-config.spec.ts`
- Modify: `projects/ui-common/jest.config.ts` (add to `testMatch`)

**Interfaces:**
- Consumes: nothing.
- Produces: `TheSeamGuideMissPolicy`, `TheSeamGuidePopover`, `TheSeamGuideStep`, `TheSeamGuideConfig`, `THE_SEAM_GUIDE_DEFAULTS`, `TheSeamGuideCloseReason`, `TheSeamGuideResult`, `TheSeamGuideEvent`, `TheSeamGuideBusyError`, `TheSeamGuideTargetTimeoutError`.

- [ ] **Step 1: Add the guide directory to Jest's testMatch**

In `projects/ui-common/jest.config.ts`, add one line to the `testMatch` array after the `'**/file-input/**/*.spec.ts'` entry:

```ts
    '**/guide/**/*.spec.ts',
```

- [ ] **Step 2: Write the failing test**

Create `projects/ui-common/guide/models/guide-config.spec.ts`:

```ts
import { THE_SEAM_GUIDE_DEFAULTS } from './guide-config'

describe('THE_SEAM_GUIDE_DEFAULTS', () => {
  it('uses the values agreed in the design spec', () => {
    expect(THE_SEAM_GUIDE_DEFAULTS).toEqual({
      dismissible: true,
      targetTimeout: 3000,
      onMissingTarget: 'skip',
      targetLostGrace: 1000,
      onTargetLost: 'elementless',
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest projects/ui-common/guide/models/guide-config.spec.ts`
Expected: FAIL — `Cannot find module './guide-config'`

- [ ] **Step 4: Create the model files**

`projects/ui-common/guide/models/guide-step.ts`:

```ts
import { ElementRef } from '@angular/core'
import { Observable } from 'rxjs'

/** What to do when a step's target element cannot be resolved. */
export type TheSeamGuideMissPolicy = 'skip' | 'elementless' | 'end'

export interface TheSeamGuidePopover {
  title?: string
  description?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export interface TheSeamGuideStep {
  /**
   * Target for this step. Omit for an elementless (centered) step.
   *
   * A string is resolved against the target registry first, then falls back to
   * `document.querySelector`. Only registry-resolved targets get mid-step
   * recovery.
   */
  element?: string | Element | ElementRef<Element>

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

`projects/ui-common/guide/models/guide-config.ts`:

```ts
import { TheSeamGuideMissPolicy, TheSeamGuideStep } from './guide-step'

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

export type TheSeamGuideResolvedConfig = Required<Omit<TheSeamGuideConfig, 'steps'>>

export const THE_SEAM_GUIDE_DEFAULTS: TheSeamGuideResolvedConfig = {
  dismissible: true,
  targetTimeout: 3000,
  onMissingTarget: 'skip',
  targetLostGrace: 1000,
  onTargetLost: 'elementless',
}
```

`projects/ui-common/guide/models/guide-event.ts`:

```ts
import { TheSeamGuideStep } from './guide-step'

export type TheSeamGuideCloseReason =
  | 'completed'
  | 'dismissed'
  | 'targetMissing'
  | 'superseded'
  | 'destroyed'

export interface TheSeamGuideResult {
  reason: TheSeamGuideCloseReason
  /** Index of the step that was active when the guide closed, or -1. */
  lastIndex: number
}

export type TheSeamGuideEvent =
  | { type: 'started' }
  | { type: 'stepChanged'; index: number; step: TheSeamGuideStep }
  | { type: 'stepSkipped'; index: number; step: TheSeamGuideStep }
  | { type: 'targetLost'; index: number; step: TheSeamGuideStep }
  | { type: 'targetRecovered'; index: number; step: TheSeamGuideStep }
  | { type: 'closed'; result: TheSeamGuideResult }
```

`projects/ui-common/guide/models/guide-errors.ts`:

```ts
export class TheSeamGuideBusyError extends Error {
  constructor() {
    super(
      'TheSeamGuide: a non-dismissible guide is already active. Wait for' +
        ' `activeGuide()?.afterClosed$` before starting another guide.',
    )
    this.name = 'TheSeamGuideBusyError'
  }
}

export class TheSeamGuideTargetTimeoutError extends Error {
  constructor(public readonly targetName: string) {
    super(`TheSeamGuide: timed out waiting for target "${targetName}".`)
    this.name = 'TheSeamGuideTargetTimeoutError'
  }
}
```

- [ ] **Step 5: Create the entry point files**

`projects/ui-common/guide/ng-package.json`:

```json
{
  "$schema": "ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "public-api.ts"
  }
}
```

`projects/ui-common/guide/public-api.ts`:

```ts
export * from './models/guide-step'
export * from './models/guide-config'
export * from './models/guide-event'
export * from './models/guide-errors'
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest projects/ui-common/guide/models/guide-config.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/guide projects/ui-common/jest.config.ts
git commit -m "feat(guide): scaffold entry point and models"
```

---

## Task 2: Target registry

**Files:**
- Create: `projects/ui-common/guide/target/guide-target-registry.ts`
- Test: `projects/ui-common/guide/target/guide-target-registry.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`

**Interfaces:**
- Consumes: `TheSeamGuideTargetTimeoutError` from `models/guide-errors`.
- Produces: `TheSeamGuideTargetRegistry` with `register(name, element): void`, `unregister(name, element): void`, `resolve(name): Element | null`, `waitFor(name, timeoutMs): Observable<Element>`, `readonly changes$: Observable<string>`.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/guide/target/guide-target-registry.spec.ts`:

```ts
import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideTargetTimeoutError } from '../models/guide-errors'
import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/** Creates an element attached to the document so `isConnected` is true. */
function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('TheSeamGuideTargetRegistry', () => {
  let registry: TheSeamGuideTargetRegistry

  beforeEach(() => {
    registry = new TheSeamGuideTargetRegistry()
    document.body.innerHTML = ''
  })

  it('resolves a registered, connected element', () => {
    const el = connectedEl()
    registry.register('a', el)
    expect(registry.resolve('a')).toBe(el)
  })

  it('returns null for an unknown name', () => {
    expect(registry.resolve('nope')).toBeNull()
  })

  it('ignores elements that are no longer connected to the document', () => {
    const el = document.createElement('div')
    registry.register('a', el)
    expect(registry.resolve('a')).toBeNull()
  })

  it('returns the most recently registered connected element for duplicates', () => {
    const first = connectedEl()
    const second = connectedEl()
    registry.register('a', first)
    registry.register('a', second)
    expect(registry.resolve('a')).toBe(second)
  })

  it('resolves the remaining element after one of a duplicate pair unregisters', () => {
    const first = connectedEl()
    const second = connectedEl()
    registry.register('a', first)
    registry.register('a', second)
    registry.unregister('a', second)
    expect(registry.resolve('a')).toBe(first)
  })

  it('waitFor emits immediately when already registered', fakeAsync(() => {
    const el = connectedEl()
    registry.register('a', el)

    let resolved: Element | null = null
    registry.waitFor('a', 1000).subscribe((e) => (resolved = e))
    tick()

    expect(resolved).toBe(el)
  }))

  it('waitFor emits when the element registers later', fakeAsync(() => {
    let resolved: Element | null = null
    registry.waitFor('a', 1000).subscribe((e) => (resolved = e))
    tick(500)
    expect(resolved).toBeNull()

    const el = connectedEl()
    registry.register('a', el)
    tick()

    expect(resolved).toBe(el)
  }))

  it('waitFor errors with TheSeamGuideTargetTimeoutError on timeout', fakeAsync(() => {
    let error: unknown = null
    registry.waitFor('a', 1000).subscribe({ error: (e) => (error = e) })
    tick(1000)

    expect(error).toBeInstanceOf(TheSeamGuideTargetTimeoutError)
    expect((error as TheSeamGuideTargetTimeoutError).targetName).toBe('a')
  }))

  it('re-registration after destroy resolves again', fakeAsync(() => {
    const first = connectedEl()
    registry.register('a', first)
    registry.unregister('a', first)
    expect(registry.resolve('a')).toBeNull()

    const second = connectedEl()
    registry.register('a', second)
    expect(registry.resolve('a')).toBe(second)
  }))
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/guide/target/guide-target-registry.spec.ts`
Expected: FAIL — `Cannot find module './guide-target-registry'`

- [ ] **Step 3: Implement the registry**

Create `projects/ui-common/guide/target/guide-target-registry.ts`:

```ts
import { Injectable, isDevMode } from '@angular/core'
import { defer, Observable, of, Subject, throwError } from 'rxjs'
import { filter, map, take, timeout } from 'rxjs/operators'

import { TheSeamGuideTargetTimeoutError } from '../models/guide-errors'

/**
 * Tracks elements registered by `[seamGuideTarget]` so a guide can await a
 * target that does not exist yet, and notice one that disappears.
 */
@Injectable({ providedIn: 'root' })
export class TheSeamGuideTargetRegistry {
  private readonly _targets = new Map<string, Element[]>()
  private readonly _changes = new Subject<string>()

  /** Emits the target name whenever its registrations change. */
  readonly changes$: Observable<string> = this._changes.asObservable()

  register(name: string, element: Element): void {
    const list = this._targets.get(name) ?? []
    if (!list.includes(element)) {
      list.push(element)
    }
    this._targets.set(name, list)

    if (isDevMode() && list.filter((e) => e.isConnected).length > 1) {
      console.warn(
        `TheSeamGuideTargetRegistry: more than one connected element is` +
          ` registered as guide target "${name}". The most recently registered` +
          ` one will be used, which may not be the one you meant.`,
      )
    }

    this._changes.next(name)
  }

  unregister(name: string, element: Element): void {
    const list = this._targets.get(name)
    if (!list) {
      return
    }
    const index = list.indexOf(element)
    if (index === -1) {
      return
    }
    list.splice(index, 1)
    if (list.length === 0) {
      this._targets.delete(name)
    }
    this._changes.next(name)
  }

  /** The most recently registered element for `name` that is still in the DOM. */
  resolve(name: string): Element | null {
    const list = this._targets.get(name)
    if (!list) {
      return null
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].isConnected) {
        return list[i]
      }
    }
    return null
  }

  /** Emits as soon as `name` resolves. Errors with a timeout error otherwise. */
  waitFor(name: string, timeoutMs: number): Observable<Element> {
    return defer(() => {
      const existing = this.resolve(name)
      if (existing !== null) {
        return of(existing)
      }
      return this._changes.pipe(
        filter((changed) => changed === name),
        map(() => this.resolve(name)),
        filter((el): el is Element => el !== null),
        take(1),
        timeout({
          first: timeoutMs,
          with: () => throwError(() => new TheSeamGuideTargetTimeoutError(name)),
        }),
      )
    })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/guide/target/guide-target-registry.spec.ts`
Expected: PASS, 9 tests

- [ ] **Step 5: Export from public-api**

Add to `projects/ui-common/guide/public-api.ts`:

```ts
export * from './target/guide-target-registry'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add target registry with waitFor and duplicate handling"
```

---

## Task 3: Target directive

**Files:**
- Create: `projects/ui-common/guide/target/guide-target.directive.ts`
- Test: `projects/ui-common/guide/target/guide-target.directive.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`

**Interfaces:**
- Consumes: `TheSeamGuideTargetRegistry`.
- Produces: `TheSeamGuideTargetDirective`, selector `[seamGuideTarget]`, standalone, input `seamGuideTarget: string` (required).

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/guide/target/guide-target.directive.spec.ts`:

```ts
import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'
import { TheSeamGuideTargetDirective } from './guide-target.directive'

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    @if (show()) {
      <div [seamGuideTarget]="name()">target</div>
    }
  `,
})
class HostComponent {
  readonly show = signal(true)
  readonly name = signal('alpha')
}

describe('TheSeamGuideTargetDirective', () => {
  let registry: TheSeamGuideTargetRegistry

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] })
    registry = TestBed.inject(TheSeamGuideTargetRegistry)
  })

  it('registers its host element on init', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    const resolved = registry.resolve('alpha')
    expect(resolved).not.toBeNull()
    expect(resolved?.textContent).toBe('target')
  })

  it('unregisters when the host element is destroyed', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    expect(registry.resolve('alpha')).not.toBeNull()

    fixture.componentInstance.show.set(false)
    fixture.detectChanges()

    expect(registry.resolve('alpha')).toBeNull()
  })

  it('moves its registration when the name changes', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    fixture.componentInstance.name.set('beta')
    fixture.detectChanges()

    expect(registry.resolve('alpha')).toBeNull()
    expect(registry.resolve('beta')).not.toBeNull()
  })

  it('registers again after being destroyed and recreated', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    const first = registry.resolve('alpha')

    fixture.componentInstance.show.set(false)
    fixture.detectChanges()
    fixture.componentInstance.show.set(true)
    fixture.detectChanges()

    const second = registry.resolve('alpha')
    expect(second).not.toBeNull()
    expect(second).not.toBe(first)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/guide/target/guide-target.directive.spec.ts`
Expected: FAIL — `Cannot find module './guide-target.directive'`

- [ ] **Step 3: Implement the directive**

Create `projects/ui-common/guide/target/guide-target.directive.ts`:

```ts
import { Directive, ElementRef, effect, inject, input, OnDestroy } from '@angular/core'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/**
 * Marks an element as a named guide target.
 *
 * Registering on init and unregistering on destroy is what lets a guide await a
 * target that has not rendered yet, and recover when one is destroyed and
 * recreated mid-step.
 */
@Directive({
  selector: '[seamGuideTarget]',
  standalone: true,
})
export class TheSeamGuideTargetDirective implements OnDestroy {
  private readonly _registry = inject(TheSeamGuideTargetRegistry)
  private readonly _elementRef = inject<ElementRef<Element>>(ElementRef)

  readonly seamGuideTarget = input.required<string>()

  private _registeredName: string | null = null

  constructor() {
    effect(() => {
      const name = this.seamGuideTarget()
      if (this._registeredName === name) {
        return
      }
      const element = this._elementRef.nativeElement
      if (this._registeredName !== null) {
        this._registry.unregister(this._registeredName, element)
      }
      this._registry.register(name, element)
      this._registeredName = name
    })
  }

  ngOnDestroy(): void {
    if (this._registeredName !== null) {
      this._registry.unregister(this._registeredName, this._elementRef.nativeElement)
      this._registeredName = null
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/guide/target/guide-target.directive.spec.ts`
Expected: PASS, 4 tests

- [ ] **Step 5: Export from public-api**

Add to `projects/ui-common/guide/public-api.ts`:

```ts
export * from './target/guide-target.directive'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add seamGuideTarget directive"
```

---

## Task 4: Adapter boundary and fake adapter

**Files:**
- Create: `projects/ui-common/guide/adapter/guide-adapter.ts`
- Create: `projects/ui-common/guide/testing/fake-guide.adapter.ts`
- Create: `projects/ui-common/guide/testing/index.ts`
- Test: `projects/ui-common/guide/testing/fake-guide.adapter.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `TheSeamGuideAdapterStep` — `{ element?: () => Element | undefined; popover?: { title?: string; description?: string | HTMLElement } }`
  - `TheSeamGuideAdapterConfig` — `{ steps: TheSeamGuideAdapterStep[]; allowUserDismiss: boolean }`
  - `TheSeamGuideAdapterCallbacks` — `{ onNextRequested(): void; onPreviousRequested(): void; onCloseRequested(): void }`
  - `TheSeamGuideAdapter` — `start`, `next`, `previous`, `moveTo`, `refresh`, `destroy`, `isActive`
  - `THE_SEAM_GUIDE_ADAPTER` — `InjectionToken<TheSeamGuideAdapter>`
  - `FakeGuideAdapter` — records calls, exposes `emitNext()`, `emitPrevious()`, `emitClose()`

**Note on the popover type:** the adapter accepts `string | HTMLElement` even though v1's public API only produces `string`. This is the boundary the spec requires be correct in v1 so the deferred template/component content work needs no adapter change.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/guide/testing/fake-guide.adapter.spec.ts`:

```ts
import { FakeGuideAdapter } from './fake-guide.adapter'

describe('FakeGuideAdapter', () => {
  it('records the config it was started with and reports active', () => {
    const adapter = new FakeGuideAdapter()
    expect(adapter.isActive()).toBe(false)

    adapter.start(
      { steps: [{ popover: { title: 'one' } }], allowUserDismiss: true },
      { onNextRequested: () => {}, onPreviousRequested: () => {}, onCloseRequested: () => {} },
    )

    expect(adapter.isActive()).toBe(true)
    expect(adapter.startedConfig?.steps).toHaveLength(1)
  })

  it('records moveTo and refresh calls in order', () => {
    const adapter = new FakeGuideAdapter()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      { onNextRequested: () => {}, onPreviousRequested: () => {}, onCloseRequested: () => {} },
    )

    adapter.moveTo(0)
    adapter.refresh()
    adapter.moveTo(1)

    expect(adapter.calls).toEqual(['start', 'moveTo:0', 'refresh', 'moveTo:1'])
  })

  it('routes emitted user intent to the registered callbacks', () => {
    const adapter = new FakeGuideAdapter()
    const next = jest.fn()
    const close = jest.fn()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      { onNextRequested: next, onPreviousRequested: () => {}, onCloseRequested: close },
    )

    adapter.emitNext()
    adapter.emitClose()

    expect(next).toHaveBeenCalledTimes(1)
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('is no longer active after destroy', () => {
    const adapter = new FakeGuideAdapter()
    adapter.start(
      { steps: [], allowUserDismiss: true },
      { onNextRequested: () => {}, onPreviousRequested: () => {}, onCloseRequested: () => {} },
    )
    adapter.destroy()
    expect(adapter.isActive()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/guide/testing/fake-guide.adapter.spec.ts`
Expected: FAIL — `Cannot find module './fake-guide.adapter'`

- [ ] **Step 3: Create the adapter boundary**

Create `projects/ui-common/guide/adapter/guide-adapter.ts`:

```ts
import { InjectionToken } from '@angular/core'

/**
 * A step as the presentation engine sees it.
 *
 * `element` is a resolver function, not an element, so the engine re-resolves
 * at paint time. That is what makes mid-step recovery a `refresh()` rather than
 * a step transition.
 */
export interface TheSeamGuideAdapterStep {
  element?: () => Element | undefined
  popover?: {
    title?: string
    /**
     * `HTMLElement` is accepted so that template and component popover content
     * can be added later without changing the adapter boundary. v1 only ever
     * passes a string.
     */
    description?: string | HTMLElement
  }
}

export interface TheSeamGuideAdapterConfig {
  steps: TheSeamGuideAdapterStep[]
  /** When false, Escape, overlay click, and the close button must not dismiss. */
  allowUserDismiss: boolean
}

/** How the engine reports user intent. It never advances itself. */
export interface TheSeamGuideAdapterCallbacks {
  onNextRequested(): void
  onPreviousRequested(): void
  onCloseRequested(): void
}

export interface TheSeamGuideAdapter {
  start(config: TheSeamGuideAdapterConfig, callbacks: TheSeamGuideAdapterCallbacks): void
  next(): void
  previous(): void
  moveTo(index: number): void
  refresh(): void
  destroy(): void
  isActive(): boolean
}

export const THE_SEAM_GUIDE_ADAPTER = new InjectionToken<TheSeamGuideAdapter>(
  'THE_SEAM_GUIDE_ADAPTER',
)
```

- [ ] **Step 4: Create the fake adapter and barrel**

Create `projects/ui-common/guide/testing/fake-guide.adapter.ts`:

```ts
import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterCallbacks,
  TheSeamGuideAdapterConfig,
} from '../adapter/guide-adapter'

/**
 * Engine-free adapter for specs. Records what the service asked for and lets a
 * test simulate user intent without a DOM.
 */
export class FakeGuideAdapter implements TheSeamGuideAdapter {
  readonly calls: string[] = []

  startedConfig: TheSeamGuideAdapterConfig | null = null

  private _callbacks: TheSeamGuideAdapterCallbacks | null = null
  private _active = false

  start(config: TheSeamGuideAdapterConfig, callbacks: TheSeamGuideAdapterCallbacks): void {
    this.startedConfig = config
    this._callbacks = callbacks
    this._active = true
    this.calls.push('start')
  }

  next(): void {
    this.calls.push('next')
  }

  previous(): void {
    this.calls.push('previous')
  }

  moveTo(index: number): void {
    this.calls.push(`moveTo:${index}`)
  }

  refresh(): void {
    this.calls.push('refresh')
  }

  destroy(): void {
    this._active = false
    this.calls.push('destroy')
  }

  isActive(): boolean {
    return this._active
  }

  /** Resolves the element for a step, as the engine would at paint time. */
  resolveStepElement(index: number): Element | undefined {
    return this.startedConfig?.steps[index]?.element?.()
  }

  emitNext(): void {
    this._callbacks?.onNextRequested()
  }

  emitPrevious(): void {
    this._callbacks?.onPreviousRequested()
  }

  emitClose(): void {
    this._callbacks?.onCloseRequested()
  }
}
```

Create `projects/ui-common/guide/testing/index.ts`:

```ts
export * from './fake-guide.adapter'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest projects/ui-common/guide/testing/fake-guide.adapter.spec.ts`
Expected: PASS, 4 tests

- [ ] **Step 6: Export the adapter boundary from public-api**

Add to `projects/ui-common/guide/public-api.ts`:

```ts
export * from './adapter/guide-adapter'
```

Do **not** export anything from `testing/` here, and do **not** export the driver.js adapter.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add adapter boundary and fake adapter for specs"
```

---

## Task 5: Guide ref, session skeleton, and service concurrency

**Files:**
- Create: `projects/ui-common/guide/guide-ref.ts`
- Create: `projects/ui-common/guide/guide-session.ts`
- Create: `projects/ui-common/guide/guide.service.ts`
- Test: `projects/ui-common/guide/guide.service.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`

**Interfaces:**
- Consumes: `TheSeamGuideAdapter`, `THE_SEAM_GUIDE_ADAPTER`, config/event/error models.
- Produces:
  - `TheSeamGuideSessionController` (internal) — `next()`, `previous()`, `moveTo(i)`, `refresh()`, `close(reason)`
  - `TheSeamGuideRef` — `events$`, `afterClosed$`, `activeIndex`, `next()`, `previous()`, `moveTo(i)`, `refresh()`, `close(reason?)`, and internal `dismissible`
  - `TheSeamGuideService` — `activeGuide: Signal<TheSeamGuideRef | null>`, `start(config): TheSeamGuideRef`, `highlight(step): TheSeamGuideRef`
  - `provideTheSeamGuide(options?)` — added in Task 8; this task leaves the service depending on `THE_SEAM_GUIDE_ADAPTER`.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/guide/guide.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideEvent } from './models/guide-event'
import { TheSeamGuideService } from './guide.service'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

describe('TheSeamGuideService', () => {
  let service: TheSeamGuideService
  let adapter: FakeGuideAdapter

  beforeEach(() => {
    adapter = new FakeGuideAdapter()
    TestBed.configureTestingModule({
      providers: [{ provide: THE_SEAM_GUIDE_ADAPTER, useValue: adapter }],
    })
    service = TestBed.inject(TheSeamGuideService)
  })

  it('has no active guide before start', () => {
    expect(service.activeGuide()).toBeNull()
  })

  it('exposes the ref as the active guide after start', () => {
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    expect(service.activeGuide()).toBe(ref)
  })

  it('emits a started event', async () => {
    const events: TheSeamGuideEvent[] = []
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    ref.events$.subscribe((e) => events.push(e))
    await Promise.resolve()

    expect(events.some((e) => e.type === 'started')).toBe(true)
  })

  it('starts the adapter with allowUserDismiss true by default', () => {
    service.start({ steps: [{ popover: { title: 'one' } }] })
    expect(adapter.startedConfig?.allowUserDismiss).toBe(true)
  })

  it('starts the adapter with allowUserDismiss false when not dismissible', () => {
    service.start({ steps: [{ popover: { title: 'one' } }], dismissible: false })
    expect(adapter.startedConfig?.allowUserDismiss).toBe(false)
  })

  it('supersedes a dismissible active guide', async () => {
    const first = service.start({ steps: [{ popover: { title: 'one' } }] })
    const closed = firstValueFromAfterClosed(first)

    const second = service.start({ steps: [{ popover: { title: 'two' } }] })

    expect(await closed).toEqual({ reason: 'superseded', lastIndex: expect.any(Number) })
    expect(service.activeGuide()).toBe(second)
  })

  it('throws TheSeamGuideBusyError rather than superseding a non-dismissible guide', () => {
    service.start({ steps: [{ popover: { title: 'one' } }], dismissible: false })

    expect(() => service.start({ steps: [{ popover: { title: 'two' } }] })).toThrow(
      TheSeamGuideBusyError,
    )
  })

  it('closes a non-dismissible guide programmatically', async () => {
    const ref = service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
    })
    const closed = firstValueFromAfterClosed(ref)

    ref.close()

    expect((await closed).reason).toBe('dismissed')
    expect(service.activeGuide()).toBeNull()
  })

  it('clears the active guide once closed', async () => {
    const ref = service.start({ steps: [{ popover: { title: 'one' } }] })
    ref.close()
    await Promise.resolve()
    expect(service.activeGuide()).toBeNull()
  })

  it('warns in dev mode when a non-dismissible guide would silently skip steps', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    service.start({
      steps: [{ popover: { title: 'one' } }],
      dismissible: false,
      onMissingTarget: 'skip',
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('dismissible: false'))
    warn.mockRestore()
  })
})

function firstValueFromAfterClosed(ref: { afterClosed$: { subscribe: Function } }) {
  return new Promise<{ reason: string; lastIndex: number }>((resolve) => {
    ref.afterClosed$.subscribe((r: { reason: string; lastIndex: number }) => resolve(r))
  })
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/guide/guide.service.spec.ts`
Expected: FAIL — `Cannot find module './guide.service'`

- [ ] **Step 3: Implement the ref**

Create `projects/ui-common/guide/guide-ref.ts`:

```ts
import { Signal } from '@angular/core'
import { Observable } from 'rxjs'

import { TheSeamGuideCloseReason, TheSeamGuideEvent, TheSeamGuideResult } from './models/guide-event'

/** What a ref is allowed to ask its session to do. Internal. */
export interface TheSeamGuideSessionController {
  readonly events$: Observable<TheSeamGuideEvent>
  readonly afterClosed$: Observable<TheSeamGuideResult>
  readonly activeIndex: Signal<number>
  readonly dismissible: boolean
  next(): void
  previous(): void
  moveTo(index: number): void
  refresh(): void
  close(reason: TheSeamGuideCloseReason): void
}

/** Consumer-facing handle to a running guide. */
export class TheSeamGuideRef {
  constructor(private readonly _session: TheSeamGuideSessionController) {}

  get events$(): Observable<TheSeamGuideEvent> {
    return this._session.events$
  }

  get afterClosed$(): Observable<TheSeamGuideResult> {
    return this._session.afterClosed$
  }

  get activeIndex(): Signal<number> {
    return this._session.activeIndex
  }

  /** Whether the user may dismiss this guide. Read by the service's concurrency rule. */
  get dismissible(): boolean {
    return this._session.dismissible
  }

  next(): void {
    this._session.next()
  }

  previous(): void {
    this._session.previous()
  }

  moveTo(index: number): void {
    this._session.moveTo(index)
  }

  refresh(): void {
    this._session.refresh()
  }

  /** Always works, including when `dismissible` is false. */
  close(reason: TheSeamGuideCloseReason = 'dismissed'): void {
    this._session.close(reason)
  }
}
```

- [ ] **Step 4: Implement the session skeleton**

Create `projects/ui-common/guide/guide-session.ts`. Task 6 adds transitions and Task 7 adds recovery; this is the shell that starts, emits, and closes.

```ts
import { signal, Signal } from '@angular/core'
import { Observable, ReplaySubject, Subject } from 'rxjs'

import { TheSeamGuideAdapter, TheSeamGuideAdapterStep } from './adapter/guide-adapter'
import { TheSeamGuideSessionController } from './guide-ref'
import {
  TheSeamGuideConfig,
  TheSeamGuideResolvedConfig,
  THE_SEAM_GUIDE_DEFAULTS,
} from './models/guide-config'
import {
  TheSeamGuideCloseReason,
  TheSeamGuideEvent,
  TheSeamGuideResult,
} from './models/guide-event'
import { TheSeamGuideStep } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'

export class TheSeamGuideSession implements TheSeamGuideSessionController {
  private readonly _events = new Subject<TheSeamGuideEvent>()
  private readonly _afterClosed = new ReplaySubject<TheSeamGuideResult>(1)
  private readonly _activeIndex = signal(-1)

  private _closed = false

  readonly steps: TheSeamGuideStep[]
  readonly options: TheSeamGuideResolvedConfig

  readonly events$: Observable<TheSeamGuideEvent> = this._events.asObservable()
  readonly afterClosed$: Observable<TheSeamGuideResult> = this._afterClosed.asObservable()
  readonly activeIndex: Signal<number> = this._activeIndex.asReadonly()

  constructor(
    config: TheSeamGuideConfig,
    private readonly _adapter: TheSeamGuideAdapter,
    private readonly _registry: TheSeamGuideTargetRegistry,
    private readonly _onClosed: (session: TheSeamGuideSession) => void,
  ) {
    this.steps = config.steps
    this.options = { ...THE_SEAM_GUIDE_DEFAULTS, ...stripUndefined(config) }
  }

  get dismissible(): boolean {
    return this.options.dismissible
  }

  start(): void {
    this._adapter.start(
      {
        steps: this.steps.map((step) => this._toAdapterStep(step)),
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

  next(): void {
    this.moveTo(this._activeIndex() + 1)
  }

  previous(): void {
    this.moveTo(this._activeIndex() - 1)
  }

  /** Replaced in Task 6 by the full transition sequence. */
  moveTo(index: number): void {
    if (this._closed) {
      return
    }
    if (index >= this.steps.length) {
      this.close('completed')
      return
    }
    if (index < 0) {
      return
    }
    this._activeIndex.set(index)
    this._adapter.moveTo(index)
    this._emit({ type: 'stepChanged', index, step: this.steps[index] })
  }

  refresh(): void {
    this._adapter.refresh()
  }

  close(reason: TheSeamGuideCloseReason): void {
    if (this._closed) {
      return
    }
    this._closed = true
    const result: TheSeamGuideResult = { reason, lastIndex: this._activeIndex() }
    this._adapter.destroy()
    this._emit({ type: 'closed', result })
    this._afterClosed.next(result)
    this._afterClosed.complete()
    this._events.complete()
    this._onClosed(this)
  }

  protected _emit(event: TheSeamGuideEvent): void {
    this._events.next(event)
  }

  /** Element is a resolver function so the engine re-resolves at paint time. */
  protected _toAdapterStep(step: TheSeamGuideStep): TheSeamGuideAdapterStep {
    return {
      element: step.element === undefined ? undefined : () => this._resolveNow(step) ?? undefined,
      popover: step.popover === undefined ? undefined : { ...step.popover },
    }
  }

  /** Synchronous best-effort resolution. Task 6 adds the awaiting version. */
  protected _resolveNow(step: TheSeamGuideStep): Element | null {
    const target = step.element
    if (target === undefined) {
      return null
    }
    if (typeof target === 'string') {
      return this._registry.resolve(target) ?? document.querySelector(target)
    }
    if (target instanceof Element) {
      return target
    }
    return target.nativeElement
  }
}

function stripUndefined(config: TheSeamGuideConfig): Partial<TheSeamGuideResolvedConfig> {
  const { steps: _steps, ...rest } = config
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      out[key] = value
    }
  }
  return out as Partial<TheSeamGuideResolvedConfig>
}
```

- [ ] **Step 5: Implement the service**

Create `projects/ui-common/guide/guide.service.ts`:

```ts
import { inject, Injectable, isDevMode, signal, Signal } from '@angular/core'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideStep } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'

@Injectable({ providedIn: 'root' })
export class TheSeamGuideService {
  private readonly _adapter = inject(THE_SEAM_GUIDE_ADAPTER)
  private readonly _registry = inject(TheSeamGuideTargetRegistry)

  private readonly _activeGuide = signal<TheSeamGuideRef | null>(null)

  /**
   * The running guide, or null. Exposed so a caller can queue itself:
   * `activeGuide()?.afterClosed$.subscribe(() => start(next))`.
   */
  readonly activeGuide: Signal<TheSeamGuideRef | null> = this._activeGuide.asReadonly()

  /**
   * Starts a guide. One runs at a time: a dismissible active guide is
   * superseded, a non-dismissible one throws `TheSeamGuideBusyError`.
   */
  start(config: TheSeamGuideConfig): TheSeamGuideRef {
    const active = this._activeGuide()
    if (active !== null) {
      if (!active.dismissible) {
        throw new TheSeamGuideBusyError()
      }
      active.close('superseded')
    }

    if (isDevMode() && config.dismissible === false && (config.onMissingTarget ?? 'skip') === 'skip') {
      console.warn(
        'TheSeamGuideService: this guide sets `dismissible: false` with' +
          ' `onMissingTarget: \'skip\'`, so the user is forced through a guide' +
          ' that may silently drop its own steps. Consider onMissingTarget:' +
          " 'end' or 'elementless'.",
      )
    }

    let ref: TheSeamGuideRef
    const session = new TheSeamGuideSession(config, this._adapter, this._registry, () =>
      this._clearIfCurrent(ref),
    )
    ref = new TheSeamGuideRef(session)
    this._activeGuide.set(ref)
    session.start()
    return ref
  }

  /** Highlights a single element. A one-step guide. */
  highlight(step: TheSeamGuideStep): TheSeamGuideRef {
    return this.start({ steps: [step] })
  }

  private _clearIfCurrent(ref: TheSeamGuideRef): void {
    if (this._activeGuide() === ref) {
      this._activeGuide.set(null)
    }
  }
}
```

> **Implementation note:** `_clearIfCurrent(ref)` is referenced inside the callback passed to the session before `ref` is assigned. That is fine because the callback only runs after `start()`, but if the linter objects, hoist `let ref: TheSeamGuideRef` and assign before `session.start()`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/guide/guide.service.spec.ts`
Expected: PASS, 10 tests

- [ ] **Step 7: Export from public-api**

Add to `projects/ui-common/guide/public-api.ts`:

```ts
export * from './guide-ref'
export * from './guide.service'
```

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add guide ref, session, and service concurrency rules"
```

---

## Task 6: Step transitions — hooks, resolution, miss policy, cancellation

**Files:**
- Modify: `projects/ui-common/guide/guide-session.ts`
- Test: `projects/ui-common/guide/guide-session.spec.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: `TheSeamGuideSession.moveTo(index)` now runs the full sequence — `afterStep` of the outgoing step, `beforeStep` of the incoming step, target resolution with timeout, miss policy, `adapter.moveTo`, `stepChanged`. Transitions are cancellable.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/guide/guide-session.spec.ts`:

```ts
import { fakeAsync, tick } from '@angular/core/testing'
import { of } from 'rxjs'

import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideEvent } from './models/guide-event'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function makeSession(config: TheSeamGuideConfig) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const events: TheSeamGuideEvent[] = []
  const session = new TheSeamGuideSession(config, adapter, registry, () => {})
  session.events$.subscribe((e) => events.push(e))
  return { adapter, registry, events, session }
}

describe('TheSeamGuideSession transitions', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('runs beforeStep before painting the step', fakeAsync(() => {
    const order: string[] = []
    const { adapter, session } = makeSession({
      steps: [{ popover: { title: 'one' }, beforeStep: () => void order.push('before') }],
    })
    const origMoveTo = adapter.moveTo.bind(adapter)
    adapter.moveTo = (i: number) => {
      order.push('paint')
      origMoveTo(i)
    }

    session.start()
    tick()

    expect(order).toEqual(['before', 'paint'])
  }))

  it('runs afterStep of the outgoing step before beforeStep of the incoming one', fakeAsync(() => {
    const order: string[] = []
    const { session } = makeSession({
      steps: [
        { popover: { title: 'one' }, afterStep: () => void order.push('after-1') },
        { popover: { title: 'two' }, beforeStep: () => void order.push('before-2') },
      ],
    })

    session.start()
    tick()
    session.next()
    tick()

    expect(order).toEqual(['after-1', 'before-2'])
  }))

  it('awaits a promise returned from beforeStep', fakeAsync(() => {
    let resolved = false
    const { adapter, session } = makeSession({
      steps: [
        {
          popover: { title: 'one' },
          beforeStep: () =>
            new Promise<void>((resolve) =>
              setTimeout(() => {
                resolved = true
                resolve()
              }, 100),
            ),
        },
      ],
    })

    session.start()
    tick(50)
    expect(adapter.calls).not.toContain('moveTo:0')

    tick(50)
    expect(resolved).toBe(true)
    expect(adapter.calls).toContain('moveTo:0')
  }))

  it('awaits an observable returned from beforeStep', fakeAsync(() => {
    const { adapter, session } = makeSession({
      steps: [{ popover: { title: 'one' }, beforeStep: () => of(1) }],
    })

    session.start()
    tick()

    expect(adapter.calls).toContain('moveTo:0')
  }))

  it('waits for a named target that appears later', fakeAsync(() => {
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'late', popover: { title: 'one' } }],
    })

    session.start()
    tick(500)
    expect(adapter.calls).not.toContain('moveTo:0')

    registry.register('late', connectedEl())
    tick()

    expect(adapter.calls).toContain('moveTo:0')
  }))

  it("skips a step whose target never appears when policy is 'skip'", fakeAsync(() => {
    const { adapter, events, session } = makeSession({
      steps: [
        { element: 'never', popover: { title: 'one' } },
        { popover: { title: 'two' } },
      ],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    expect(events.some((e) => e.type === 'stepSkipped' && e.index === 0)).toBe(true)
    expect(adapter.calls).toContain('moveTo:1')
  }))

  it("ends the guide when a required step's target never appears", fakeAsync(() => {
    const { events, session } = makeSession({
      steps: [
        { element: 'never', popover: { title: 'one' }, onMissingTarget: 'end' },
        { popover: { title: 'two' } },
      ],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    const closed = events.find((e) => e.type === 'closed')
    expect(closed).toBeDefined()
    expect(closed?.type === 'closed' && closed.result.reason).toBe('targetMissing')
  }))

  it("paints an elementless step when policy is 'elementless'", fakeAsync(() => {
    const { adapter, events, session } = makeSession({
      steps: [{ element: 'never', popover: { title: 'one' }, onMissingTarget: 'elementless' }],
      targetTimeout: 1000,
    })

    session.start()
    tick(1000)
    tick()

    expect(adapter.calls).toContain('moveTo:0')
    expect(events.some((e) => e.type === 'stepChanged' && e.index === 0)).toBe(true)
  }))

  it('ends rather than looping when every remaining step misses', fakeAsync(() => {
    const { events, session } = makeSession({
      steps: [
        { element: 'never-a', popover: { title: 'one' } },
        { element: 'never-b', popover: { title: 'two' } },
      ],
      targetTimeout: 500,
    })

    session.start()
    tick(500)
    tick()
    tick(500)
    tick()

    expect(events.some((e) => e.type === 'closed')).toBe(true)
  }))

  it('warns in dev mode when a step is skipped', fakeAsync(() => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { session } = makeSession({
      steps: [{ element: 'never', popover: { title: 'one' } }, { popover: { title: 'two' } }],
      targetTimeout: 500,
    })

    session.start()
    tick(500)
    tick()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('never'))
    warn.mockRestore()
  }))

  it('abandons an in-flight transition when a new one starts', fakeAsync(() => {
    const { adapter, session } = makeSession({
      steps: [
        { popover: { title: 'one' } },
        { element: 'slow', popover: { title: 'two' } },
        { popover: { title: 'three' } },
      ],
      targetTimeout: 5000,
    })

    session.start()
    tick()
    session.next()
    tick(100)

    session.moveTo(2)
    tick()

    expect(adapter.calls).toContain('moveTo:2')
    expect(adapter.calls).not.toContain('moveTo:1')
  }))

  it('does not paint after the guide is closed', fakeAsync(() => {
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'late', popover: { title: 'one' } }],
      targetTimeout: 5000,
    })

    session.start()
    tick(100)
    session.close('dismissed')

    registry.register('late', connectedEl())
    tick(1000)

    expect(adapter.calls).not.toContain('moveTo:0')
  }))
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/guide/guide-session.spec.ts`
Expected: FAIL — several tests fail because `moveTo` is currently synchronous and ignores hooks, resolution, and policy.

- [ ] **Step 3: Replace the transition logic in the session**

In `projects/ui-common/guide/guide-session.ts`, add these imports:

```ts
import { defer, EMPTY, from, isObservable, Observable, of, Subject, Subscription } from 'rxjs'
import { catchError, map, switchMap, take, tap } from 'rxjs/operators'

import { isDevMode } from '@angular/core'
import { TheSeamGuideMissPolicy } from './models/guide-step'
```

Add these private members to the class:

```ts
  private readonly _transitions = new Subject<{ index: number; direction: 1 | -1 }>()
  private _transitionSub: Subscription | null = null
```

Add this to the end of the constructor:

```ts
    this._transitionSub = this._transitions
      .pipe(switchMap((request) => this._runTransition(request.index, request.direction)))
      .subscribe()
```

Replace `next()`, `previous()`, and `moveTo()` with:

```ts
  next(): void {
    this._request(this._activeIndex() + 1, 1)
  }

  previous(): void {
    this._request(this._activeIndex() - 1, -1)
  }

  moveTo(index: number): void {
    this._request(index, index >= this._activeIndex() ? 1 : -1)
  }

  /**
   * Requests a transition.
   *
   * The emission is deferred to a microtask because `_applyMissPolicy` calls
   * this from *inside* the `switchMap` projection. Emitting synchronously there
   * would make the transition cancel itself mid-flight. `fakeAsync`'s `tick()`
   * flushes microtasks, so specs are unaffected.
   */
  private _request(index: number, direction: 1 | -1): void {
    if (this._closed) {
      return
    }
    queueMicrotask(() => {
      if (this._closed) {
        return
      }
      this._transitions.next({ index, direction })
    })
  }
```

Add the transition implementation:

```ts
  /**
   * The one sequence every transition runs. Cancellable: a new request causes
   * `switchMap` to unsubscribe from this, so nothing paints after teardown.
   */
  private _runTransition(index: number, direction: 1 | -1): Observable<unknown> {
    if (this._closed) {
      return EMPTY
    }
    if (index >= this.steps.length) {
      this.close('completed')
      return EMPTY
    }
    if (index < 0) {
      return EMPTY
    }

    const outgoing = this._activeIndex() >= 0 ? this.steps[this._activeIndex()] : undefined
    const incoming = this.steps[index]

    return defer(() => this._runHook(outgoing?.afterStep)).pipe(
      switchMap(() => this._runHook(incoming.beforeStep)),
      switchMap(() => this._resolveTarget(incoming)),
      switchMap((outcome) => {
        if (this._closed) {
          return EMPTY
        }
        if (outcome === 'missing') {
          return this._applyMissPolicy(index, incoming, direction)
        }
        this._activeIndex.set(index)
        this._adapter.moveTo(index)
        this._emit({ type: 'stepChanged', index, step: incoming })
        this._onStepPainted(index, incoming)
        return EMPTY
      }),
    )
  }

  /** Overridden in Task 7 to arm mid-step loss detection. */
  protected _onStepPainted(_index: number, _step: TheSeamGuideStep): void {
    // no-op until Task 7
  }

  private _runHook(
    hook: (() => void | Promise<void> | Observable<unknown>) | undefined,
  ): Observable<unknown> {
    if (hook === undefined) {
      return of(null)
    }
    return defer(() => {
      const result = hook()
      if (result === undefined || result === null) {
        return of(null)
      }
      if (isObservable(result)) {
        return result.pipe(take(1))
      }
      return from(result)
    })
  }

  /** Resolves `'resolved'` or `'missing'`. Never throws. */
  private _resolveTarget(step: TheSeamGuideStep): Observable<'resolved' | 'missing'> {
    const target = step.element
    if (target === undefined) {
      return of('resolved')
    }
    if (typeof target !== 'string') {
      const el = target instanceof Element ? target : target.nativeElement
      return of(el?.isConnected ? 'resolved' : 'missing')
    }

    const direct = this._registry.resolve(target)
    if (direct !== null) {
      return of('resolved')
    }
    const selectorMatch = safeQuerySelector(target)
    if (selectorMatch !== null) {
      return of('resolved')
    }

    const timeoutMs = step.targetTimeout ?? this.options.targetTimeout
    return this._registry.waitFor(target, timeoutMs).pipe(
      map(() => 'resolved' as const),
      catchError(() => of('missing' as const)),
    )
  }

  private _applyMissPolicy(
    index: number,
    step: TheSeamGuideStep,
    direction: 1 | -1,
  ): Observable<never> {
    const policy: TheSeamGuideMissPolicy =
      step.onMissingTarget ?? this.options.onMissingTarget

    if (policy === 'end') {
      this.close('targetMissing')
      return EMPTY
    }

    if (policy === 'elementless') {
      this._activeIndex.set(index)
      this._adapter.moveTo(index)
      this._emit({ type: 'stepChanged', index, step })
      this._onStepPainted(index, step)
      return EMPTY
    }

    if (isDevMode()) {
      console.warn(
        `TheSeamGuideSession: skipping step ${index} because its target` +
          ` "${String(step.element)}" never appeared.`,
      )
    }
    this._emit({ type: 'stepSkipped', index, step })

    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= this.steps.length) {
      this.close(direction === 1 ? 'completed' : 'dismissed')
      return EMPTY
    }
    this._request(nextIndex, direction)
    return EMPTY
  }
```

Update `close()` to tear down the transition subscription. Add this line immediately after `this._closed = true`:

```ts
    this._transitionSub?.unsubscribe()
    this._transitionSub = null
```

Add this helper at the bottom of the file:

```ts
/** `querySelector` throws on an invalid selector; a registry name often is one. */
function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}
```

Also update `_resolveNow` to use `safeQuerySelector`:

```ts
    if (typeof target === 'string') {
      return this._registry.resolve(target) ?? safeQuerySelector(target)
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/guide/guide-session.spec.ts`
Expected: PASS, 12 tests

- [ ] **Step 5: Confirm nothing regressed**

Run: `npx jest projects/ui-common/guide`
Expected: PASS, all guide specs

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add step transitions with hooks, target waiting, and miss policy"
```

---

## Task 7: Mid-step target loss recovery

**Files:**
- Modify: `projects/ui-common/guide/guide-session.ts`
- Test: `projects/ui-common/guide/guide-session-recovery.spec.ts`

**Interfaces:**
- Consumes: everything from Task 6.
- Produces: recovery behavior. `targetLost` / `targetRecovered` events. `_onStepPainted` now arms detection.

**Critical property:** recovery must reuse **only** target resolution. It must never re-run `beforeStep` or `afterStep`, and must never emit `stepChanged`. These are the assertions that make the tests worth writing.

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/guide/guide-session-recovery.spec.ts`:

```ts
import { fakeAsync, tick } from '@angular/core/testing'

import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideEvent } from './models/guide-event'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'
import { FakeGuideAdapter } from './testing/fake-guide.adapter'

function connectedEl(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function makeSession(config: TheSeamGuideConfig) {
  const adapter = new FakeGuideAdapter()
  const registry = new TheSeamGuideTargetRegistry()
  const events: TheSeamGuideEvent[] = []
  const session = new TheSeamGuideSession(config, adapter, registry, () => {})
  session.events$.subscribe((e) => events.push(e))
  return { adapter, registry, events, session }
}

describe('TheSeamGuideSession mid-step target loss', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('emits targetLost when the active step target unregisters', fakeAsync(() => {
    const el = connectedEl()
    const { registry, events, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick()

    expect(events.some((e) => e.type === 'targetLost' && e.index === 0)).toBe(true)
  }))

  it('recovers within grace without re-running hooks or emitting stepChanged', fakeAsync(() => {
    const beforeStep = jest.fn()
    const afterStep = jest.fn()
    const el = connectedEl()
    const { adapter, registry, events, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' }, beforeStep, afterStep }],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    expect(beforeStep).toHaveBeenCalledTimes(1)
    const stepChangedBefore = events.filter((e) => e.type === 'stepChanged').length

    el.remove()
    registry.unregister('a', el)
    tick(200)

    const replacement = connectedEl()
    registry.register('a', replacement)
    tick()

    expect(events.some((e) => e.type === 'targetRecovered')).toBe(true)
    expect(adapter.calls).toContain('refresh')
    expect(beforeStep).toHaveBeenCalledTimes(1)
    expect(afterStep).not.toHaveBeenCalled()
    expect(events.filter((e) => e.type === 'stepChanged').length).toBe(stepChangedBefore)
  }))

  it('re-points at a different element registered under the same name', fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    const replacement = connectedEl()
    registry.register('a', replacement)
    tick()

    expect(adapter.resolveStepElement(0)).toBe(replacement)
  }))

  it("collapses to elementless when grace expires with the default policy", fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' } }],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()
    const callsBefore = adapter.calls.length

    el.remove()
    registry.unregister('a', el)
    tick(1000)

    expect(adapter.calls.slice(callsBefore)).toContain('refresh')
    expect(adapter.isActive()).toBe(true)
  }))

  it("ends the guide when grace expires and onTargetLost is 'end'", fakeAsync(() => {
    const el = connectedEl()
    const { events, registry, session } = makeSession({
      steps: [{ element: 'a', popover: { title: 'one' }, onTargetLost: 'end' }],
      targetLostGrace: 500,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(500)

    const closed = events.find((e) => e.type === 'closed')
    expect(closed?.type === 'closed' && closed.result.reason).toBe('targetMissing')
  }))

  it("advances when grace expires and onTargetLost is 'skip'", fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' }, onTargetLost: 'skip' },
        { popover: { title: 'two' } },
      ],
      targetLostGrace: 500,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(500)
    tick()

    expect(adapter.calls).toContain('moveTo:1')
  }))

  it('abandons a pending recovery when the user advances', fakeAsync(() => {
    const el = connectedEl()
    const { adapter, registry, session } = makeSession({
      steps: [
        { element: 'a', popover: { title: 'one' } },
        { popover: { title: 'two' } },
      ],
      targetLostGrace: 1000,
    })
    registry.register('a', el)

    session.start()
    tick()

    el.remove()
    registry.unregister('a', el)
    tick(200)

    session.next()
    tick()

    const callsAfterNext = adapter.calls.length
    tick(2000)

    expect(adapter.calls).toContain('moveTo:1')
    expect(adapter.calls.length).toBe(callsAfterNext)
  }))

  it('does not arm recovery for an elementless step', fakeAsync(() => {
    const { events, session } = makeSession({
      steps: [{ popover: { title: 'one' } }],
      targetLostGrace: 500,
    })

    session.start()
    tick(1000)

    expect(events.some((e) => e.type === 'targetLost')).toBe(false)
  }))
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/guide/guide-session-recovery.spec.ts`
Expected: FAIL — no `targetLost` is ever emitted.

- [ ] **Step 3: Implement recovery in the session**

In `projects/ui-common/guide/guide-session.ts`, add these members:

```ts
  private _recoverySub: Subscription | null = null
```

Replace the `_onStepPainted` stub with the real implementation, and add the recovery machinery:

```ts
  /**
   * Arms mid-step loss detection for a painted step.
   *
   * Only named targets are watched — a selector or `Element` has no
   * notification channel, so recovery does not apply to them in v1.
   */
  protected _onStepPainted(index: number, step: TheSeamGuideStep): void {
    this._disarmRecovery()

    const name = typeof step.element === 'string' ? step.element : null
    if (name === null) {
      return
    }
    if (this._registry.resolve(name) === null) {
      return
    }

    this._recoverySub = this._registry.changes$
      .pipe(
        filter((changed) => changed === name),
        filter(() => this._registry.resolve(name) === null),
        take(1),
        switchMap(() => {
          this._emit({ type: 'targetLost', index, step })
          const grace = this.options.targetLostGrace
          return this._registry.waitFor(name, grace).pipe(
            map(() => 'recovered' as const),
            catchError(() => of('lost' as const)),
          )
        }),
        tap((outcome) => {
          if (this._closed) {
            return
          }
          if (outcome === 'recovered') {
            this._adapter.refresh()
            this._emit({ type: 'targetRecovered', index, step })
            // Re-arm on a microtask: `_onStepPainted` calls `_disarmRecovery`,
            // which would otherwise unsubscribe this subscription from inside
            // its own `tap`.
            queueMicrotask(() => {
              if (!this._closed) {
                this._onStepPainted(index, step)
              }
            })
            return
          }
          this._applyTargetLostPolicy(index, step)
        }),
      )
      .subscribe()
  }

  private _applyTargetLostPolicy(index: number, step: TheSeamGuideStep): void {
    const policy: TheSeamGuideMissPolicy = step.onTargetLost ?? this.options.onTargetLost

    if (policy === 'end') {
      this.close('targetMissing')
      return
    }
    if (policy === 'skip') {
      this._request(index + 1, 1)
      return
    }
    // 'elementless' — the resolver now returns undefined, so a refresh collapses
    // the popover to centered without a step transition.
    this._adapter.refresh()
  }

  private _disarmRecovery(): void {
    this._recoverySub?.unsubscribe()
    this._recoverySub = null
  }
```

Wire the teardown. In `_runTransition`, call `this._disarmRecovery()` as the first statement after the `_closed` guard. In `close()`, add `this._disarmRecovery()` next to the transition unsubscribe.

Add `filter` to the rxjs operator import list at the top of the file:

```ts
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators'
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/guide/guide-session-recovery.spec.ts`
Expected: PASS, 8 tests

- [ ] **Step 5: Confirm nothing regressed**

Run: `npx jest projects/ui-common/guide`
Expected: PASS, all guide specs

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): recover from a target lost mid-step without re-running hooks"
```

---

## Task 8: driver.js adapter and provider

**Files:**
- Create: `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts`
- Create: `projects/ui-common/guide/guide-providers.ts`
- Test: `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`
- Modify: `projects/ui-common/guide/public-api.ts`
- Modify: `package.json`, `projects/ui-common/package.json`, `projects/ui-common/ng-package.json`

**Interfaces:**
- Consumes: `TheSeamGuideAdapter` and its config/callback types.
- Produces: `DriverJsGuideAdapter` (**not exported from public-api**) and `provideTheSeamGuide(options?: { adapter?: Type<TheSeamGuideAdapter> })`.

- [ ] **Step 1: Install driver.js**

```bash
npm install driver.js --save --legacy-peer-deps
```

Then add `"driver.js"` to `dependencies` in `projects/ui-common/package.json`, and to `allowedNonPeerDependencies` in `projects/ui-common/ng-package.json`.

- [ ] **Step 2: Write the failing test**

Create `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`:

```ts
import { DriverJsGuideAdapter } from './driver-js-guide.adapter'

describe('DriverJsGuideAdapter', () => {
  let adapter: DriverJsGuideAdapter

  beforeEach(() => {
    adapter = new DriverJsGuideAdapter()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    adapter.destroy()
  })

  const noopCallbacks = {
    onNextRequested: () => {},
    onPreviousRequested: () => {},
    onCloseRequested: () => {},
  }

  it('is inactive before start and active after', () => {
    expect(adapter.isActive()).toBe(false)
    adapter.start({ steps: [{ popover: { title: 'one' } }], allowUserDismiss: true }, noopCallbacks)
    adapter.moveTo(0)
    expect(adapter.isActive()).toBe(true)
  })

  it('is inactive after destroy', () => {
    adapter.start({ steps: [{ popover: { title: 'one' } }], allowUserDismiss: true }, noopCallbacks)
    adapter.moveTo(0)
    adapter.destroy()
    expect(adapter.isActive()).toBe(false)
  })

  it('routes a next click to onNextRequested instead of advancing itself', () => {
    const onNextRequested = jest.fn()
    adapter.start(
      {
        steps: [{ popover: { title: 'one' } }, { popover: { title: 'two' } }],
        allowUserDismiss: true,
      },
      { ...noopCallbacks, onNextRequested },
    )
    adapter.moveTo(0)

    const nextButton = document.querySelector<HTMLElement>('.driver-popover-next-btn')
    expect(nextButton).not.toBeNull()
    nextButton?.click()

    expect(onNextRequested).toHaveBeenCalledTimes(1)
  })

  it('renders an elementless step as a centered popover', () => {
    adapter.start({ steps: [{ popover: { title: 'solo' } }], allowUserDismiss: true }, noopCallbacks)
    adapter.moveTo(0)

    expect(document.querySelector('.driver-popover')).not.toBeNull()
  })

  it('resolves a step element through the resolver function at paint time', () => {
    const el = document.createElement('div')
    el.id = 'late'
    let attached = false

    adapter.start(
      {
        steps: [{ element: () => (attached ? el : undefined), popover: { title: 'one' } }],
        allowUserDismiss: true,
      },
      noopCallbacks,
    )

    document.body.appendChild(el)
    attached = true
    adapter.moveTo(0)

    expect(document.querySelector('.driver-popover')).not.toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`
Expected: FAIL — `Cannot find module './driver-js-guide.adapter'`

- [ ] **Step 4: Implement the driver.js adapter**

Create `projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.ts`. This is the **only** file permitted to import `driver.js`.

```ts
import { Injectable } from '@angular/core'
import { Config, DriveStep, driver, Driver } from 'driver.js'

import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterCallbacks,
  TheSeamGuideAdapterConfig,
  TheSeamGuideAdapterStep,
} from '../guide-adapter'

/**
 * driver.js implementation of the guide adapter.
 *
 * The whole step array is handed to driver.js so its buttons, progress
 * indicator, and keyboard handling are preserved, but every navigation click is
 * intercepted and reported instead of acted on. The session decides what
 * happens next.
 */
@Injectable()
export class DriverJsGuideAdapter implements TheSeamGuideAdapter {
  private _driver: Driver | null = null

  start(config: TheSeamGuideAdapterConfig, callbacks: TheSeamGuideAdapterCallbacks): void {
    this.destroy()

    const driverConfig: Config = {
      steps: config.steps.map((step) => this._toDriveStep(step)),
      allowClose: config.allowUserDismiss,
      showButtons: config.allowUserDismiss
        ? ['next', 'previous', 'close']
        : ['next', 'previous'],
      // Intercept every navigation: driver.js must never advance itself,
      // because the session owns sequencing.
      onNextClick: () => callbacks.onNextRequested(),
      onPrevClick: () => callbacks.onPreviousRequested(),
      onCloseClick: () => callbacks.onCloseRequested(),
      onDestroyStarted: () => callbacks.onCloseRequested(),
    }

    this._driver = driver(driverConfig)
  }

  next(): void {
    this._driver?.moveNext()
  }

  previous(): void {
    this._driver?.movePrevious()
  }

  moveTo(index: number): void {
    if (this._driver === null) {
      return
    }
    if (!this._driver.isActive()) {
      this._driver.drive(index)
      return
    }
    this._driver.moveTo(index)
  }

  refresh(): void {
    this._driver?.refresh()
  }

  destroy(): void {
    if (this._driver === null) {
      return
    }
    const instance = this._driver
    // Null first: destroy() triggers onDestroyStarted, and the session has
    // already decided to close.
    this._driver = null
    instance.destroy()
  }

  isActive(): boolean {
    return this._driver?.isActive() ?? false
  }

  private _toDriveStep(step: TheSeamGuideAdapterStep): DriveStep {
    const description = step.popover?.description
    return {
      element: step.element === undefined ? undefined : () => step.element?.() as Element,
      popover:
        step.popover === undefined
          ? undefined
          : {
              title: step.popover.title,
              description: typeof description === 'string' ? description : undefined,
              // A DOM node is appended after render, which is how template and
              // component content will work when it is added.
              onPopoverRender:
                description instanceof HTMLElement
                  ? (popover: { description: HTMLElement }) => {
                      popover.description.replaceChildren(description)
                    }
                  : undefined,
            },
    }
  }
}
```

> **If the `onPopoverRender` signature does not typecheck**, consult the driver.js
> types in `node_modules/driver.js/dist/driver.d.ts` and adjust. The v1 public API
> never produces an `HTMLElement`, so if the branch proves awkward, delete it and
> narrow the adapter's `description` to `string`, then note the change in the PR
> description — the deferred content work will re-add it.

- [ ] **Step 5: Create the provider**

Create `projects/ui-common/guide/guide-providers.ts`:

```ts
import { EnvironmentProviders, makeEnvironmentProviders, Type } from '@angular/core'

import { THE_SEAM_GUIDE_ADAPTER, TheSeamGuideAdapter } from './adapter/guide-adapter'
import { DriverJsGuideAdapter } from './adapter/driver-js/driver-js-guide.adapter'

export interface TheSeamGuideProviderOptions {
  /** Replace the presentation engine. Defaults to the driver.js adapter. */
  adapter?: Type<TheSeamGuideAdapter>
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
    { provide: THE_SEAM_GUIDE_ADAPTER, useClass: options.adapter ?? DriverJsGuideAdapter },
  ])
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest projects/ui-common/guide/adapter/driver-js/driver-js-guide.adapter.spec.ts`
Expected: PASS, 5 tests

- [ ] **Step 7: Export the provider only**

Add to `projects/ui-common/guide/public-api.ts`:

```ts
export * from './guide-providers'
```

Verify the adapter itself is not exported:

```bash
grep -rn "driver.js" projects/ui-common/guide --include=*.ts | grep -v "adapter/driver-js/"
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json projects/ui-common
git commit -m "feat(guide): add driver.js adapter and provideTheSeamGuide"
```

---

## Task 9: Styles and build configuration

**Files:**
- Create: `projects/ui-common/guide/guide-theme.scss`
- Create: `projects/ui-common/guide/styles/_variables.scss`
- Create: `projects/ui-common/guide/styles/_utilities.scss`
- Modify: `projects/ui-common/ng-package.json` (assets)
- Modify: `angular.json` (both Storybook targets)

**Interfaces:**
- Consumes: nothing.
- Produces: `@import '@theseam/ui-common/guide/guide-theme'` for apps.

- [ ] **Step 1: Create the style files**

`projects/ui-common/guide/styles/_variables.scss`:

```scss
$guide-popover-bg: $white !default;
$guide-popover-color: $body-color !default;
$guide-popover-border-radius: $border-radius !default;
$guide-popover-max-width: 20rem !default;
$guide-overlay-color: rgba(0, 0, 0, 0.6) !default;
```

`projects/ui-common/guide/styles/_utilities.scss`:

```scss
// Variables, functions, and mixins only. Must not emit CSS.
@import '../../styles/utilities';

@import './variables';
```

`projects/ui-common/guide/guide-theme.scss`:

```scss
@import './styles/utilities';

// driver.js base styles, resolved from the package. Matches how theme.scss
// imports '@angular/cdk/overlay-prebuilt' and overlayscrollbars.
@import 'driver.js/dist/driver';

.driver-popover {
  background-color: $guide-popover-bg;
  color: $guide-popover-color;
  border-radius: $guide-popover-border-radius;
  max-width: $guide-popover-max-width;
  font-family: $font-family-base;
  font-size: $font-size-base;
}

.driver-popover-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
}

.driver-popover-next-btn,
.driver-popover-prev-btn {
  @extend .btn;
  @extend .btn-sm;
}

.driver-popover-next-btn {
  @extend .btn-primary;
}

.driver-popover-prev-btn {
  @extend .btn-secondary;
}

.driver-overlay {
  fill: $guide-overlay-color;
}
```

> **If `@extend .btn` fails** because Bootstrap's button classes are not in scope
> from `styles/utilities` (which is variables/mixins only, no CSS), replace the
> `@extend` rules with `@include button-variant(...)` or explicit properties. Do
> not import `theme.scss` to get them — that would duplicate the entire global
> stylesheet into every consumer.

- [ ] **Step 2: Add the ng-packagr asset entry**

In `projects/ui-common/ng-package.json`, add to the `assets` array, next to the existing `breadcrumbs` entry:

```json
    {
      "glob": "**/*.scss",
      "input": "guide",
      "output": "guide"
    },
```

Do **not** touch the `assets` array in `projects/ui-common/package.json` — it is dead config.

- [ ] **Step 3: Add the Storybook style and asset entries**

In `angular.json`, in **both** the `storybook` and `build-storybook` targets:

Add to `styles`:

```json
        "projects/ui-common/guide/guide-theme.scss"
```

Add to `assets`:

```json
      {
        "glob": "**/*.scss",
        "input": "projects/ui-common/guide",
        "output": "guide"
      },
```

- [ ] **Step 4: Verify the library build includes the styles**

```bash
npm run build:ui-common
ls dist/ui-common/guide/guide-theme.scss dist/ui-common/guide/styles/
```

Expected: both paths exist. If `guide-theme.scss` is missing, the asset entry in Step 2 is wrong.

- [ ] **Step 5: Verify the entry point built**

```bash
ls dist/ui-common/guide/
```

Expected: contains `index.d.ts` and the FESM output alongside the copied `.scss` files.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common angular.json
git commit -m "feat(guide): add theme styles and build asset wiring"
```

---

## Task 10: Stories and test harness

**Files:**
- Create: `projects/ui-common/guide/guide.stories.ts`
- Modify: `projects/ui-common/guide/testing/index.ts`

**Interfaces:**
- Consumes: the full public API.
- Produces: CSF 3 stories with `play` functions covering the scenarios the spec calls out.

- [ ] **Step 1: Write the stories**

Create `projects/ui-common/guide/guide.stories.ts`:

```ts
import { Component, inject, signal } from '@angular/core'
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import { provideTheSeamGuide } from './guide-providers'
import { TheSeamGuideService } from './guide.service'
import { TheSeamGuideTargetDirective } from './target/guide-target.directive'

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-primary" seamGuideTarget="start" (click)="run()">
        Start guide
      </button>

      <div class="mt-3 p-3 border" seamGuideTarget="panel">A panel to highlight</div>

      @if (showLate()) {
        <div class="mt-3 p-3 border" seamGuideTarget="late">Appears later</div>
      }

      <button type="button" class="btn btn-link" (click)="showLate.set(true)">
        Reveal late target
      </button>
    </div>
  `,
})
class GuideDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  readonly showLate = signal(false)

  run(): void {
    this._guide.start({
      steps: [
        { element: 'start', popover: { title: 'Step one', description: 'This starts it.' } },
        { element: 'panel', popover: { title: 'Step two', description: 'A highlighted panel.' } },
        { popover: { title: 'Step three', description: 'No element — a centered popover.' } },
      ],
    })
  }
}

const meta: Meta<GuideDemoComponent> = {
  title: 'Guide/Guide',
  component: GuideDemoComponent,
  decorators: [moduleMetadata({ providers: [provideTheSeamGuide()] })],
}

export default meta
type Story = StoryObj<GuideDemoComponent>

export const MultiStepWalkthrough: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() => expect(document.querySelector('.driver-popover')).toBeTruthy())
    await expect(document.querySelector('.driver-popover-title')?.textContent).toBe('Step one')
  },
}

export const ElementlessStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() => expect(document.querySelector('.driver-popover')).toBeTruthy())

    const next = () =>
      document.querySelector<HTMLElement>('.driver-popover-next-btn')
    await userEvent.click(next()!)
    await userEvent.click(next()!)

    await waitFor(() =>
      expect(document.querySelector('.driver-popover-title')?.textContent).toBe('Step three'),
    )
  },
}

export const FocusMovesIntoThePopover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start guide' }))

    await waitFor(() => expect(document.querySelector('.driver-popover')).toBeTruthy())
    await waitFor(() =>
      expect(document.querySelector('.driver-popover')?.contains(document.activeElement)).toBe(
        true,
      ),
    )
  },
}
```

- [ ] **Step 2: Add a non-dismissible story**

Append to `projects/ui-common/guide/guide.stories.ts`:

```ts
@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-primary" seamGuideTarget="locked" (click)="run()">
        Start locked guide
      </button>
    </div>
  `,
})
class LockedGuideDemoComponent {
  private readonly _guide = inject(TheSeamGuideService)

  run(): void {
    this._guide.start({
      dismissible: false,
      onMissingTarget: 'end',
      steps: [
        { element: 'locked', popover: { title: 'Required', description: 'Escape will not close this.' } },
      ],
    })
  }
}

export const NonDismissible: StoryObj<LockedGuideDemoComponent> = {
  render: () => ({ component: LockedGuideDemoComponent }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Start locked guide' }))

    await waitFor(() => expect(document.querySelector('.driver-popover')).toBeTruthy())

    // No close button is rendered.
    await expect(document.querySelector('.driver-popover-close-btn')).toBeNull()

    // Escape is inert.
    await userEvent.keyboard('{Escape}')
    await expect(document.querySelector('.driver-popover')).toBeTruthy()
  },
}
```

- [ ] **Step 3: Run Storybook and confirm the styles applied**

Assume Storybook is already running on port 6007. If it is not, **ask the user before starting it** — a cold start takes several minutes.

Open the `Guide/Guide` stories and confirm the popover is styled with Bootstrap typography and button classes, **not** driver.js defaults. This is the visible signal that the `angular.json` `styles` entry from Task 9 took effect.

- [ ] **Step 4: Run the Storybook test runner**

```bash
npm run test-storybook -- --testPathPattern guide
```

Expected: all guide stories pass.

- [ ] **Step 5: Run the full check**

```bash
npm run lint
npm run test:ci
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/guide
git commit -m "feat(guide): add stories covering walkthrough, elementless, focus, and locked guides"
```

---

## Self-Review Notes

**Spec coverage check — every spec section maps to a task:**

| Spec section | Task |
| --- | --- |
| Naming, entry point | 1 |
| Models, defaults | 1 |
| Registry, duplicates, re-registration | 2 |
| Directive | 3 |
| Adapter boundary, `THE_SEAM_GUIDE_ADAPTER` | 4 |
| Driving driver.js (whole array + intercept) | 8 |
| Resolver function for `element` | 5 (`_toAdapterStep`), 8 |
| Step lifecycle sequence | 6 |
| Miss policy + dev warning | 6 |
| Cancellation via `switchMap` | 6 |
| Mid-step target loss, grace, `onTargetLost` | 7 |
| Dismissal, concurrency, busy error, dev warning | 5 |
| `TheSeamGuideRef`, events, close reasons | 5 |
| Exports, provider, adapter not exported | 4, 8 |
| Popover content (string in v1, `HTMLElement` at boundary) | 4, 8 |
| Styling, `guide-theme.scss`, asset entry | 9 |
| Storybook styles + assets | 9 |
| Testing: registry, transitions, recovery, stories | 2, 6, 7, 10 |
| Build verification | 9 |

**Known risks flagged inline rather than hidden:**

1. **`onPopoverRender` typing** (Task 8, Step 4) — the `HTMLElement` description branch is written from the documented hook but not verified against driver.js's `.d.ts`. Fallback instruction is inline.
2. **`@extend .btn` scope** (Task 9, Step 1) — `styles/utilities` emits no CSS, so Bootstrap's button *classes* may not be extendable from there. Fallback instruction is inline.
3. **`targetTimeout: 3000` and `targetLostGrace: 1000`** are invented values, not measured. The grace window in particular should be revisited if a real data-refresh interval exceeds it.
4. **`effect()` registration timing** (Task 3) — the directive registers in an effect, which runs after first change detection. All consumers await targets asynchronously, so this is safe, but it is why the directive specs assert after `detectChanges()`.
5. **Microtask-deferred transitions** (Tasks 6 and 7) — two re-entrancy hazards were found while writing the plan and are already fixed in the code above, but they are the kind of thing a refactor can silently reintroduce:
   - `_applyMissPolicy` requests the next step from inside the `switchMap` projection. A synchronous emit there makes the transition cancel itself, so `'skip'` would drop *every* remaining step instead of advancing one.
   - Recovery re-arms itself from inside its own subscription's `tap`, which would unsubscribe the subscription that is currently running.

   Both are handled with `queueMicrotask`. `fakeAsync`'s `tick()` flushes microtasks, so the specs read normally. If either is changed to a synchronous call, the tests in Task 6 (`'skips a step whose target never appears'`) and Task 7 (`'recovers within grace'`) are the ones that catch it.
