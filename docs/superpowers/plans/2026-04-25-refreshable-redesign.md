# Refreshable<T> Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unused `Refreshable<T>` in ui-common with a generic, lazy, multicast primitive that takes `invalidate$` and `poll$` signals, then migrate the scaffold's `WidgetsService` and three widget components to consume it.

**Architecture:** A class with three input observables (`action`, optional `invalidate$`, optional `poll$`) and three outputs (`data$`, `loading$`, `initialized$`) plus a `refresh()` method. Internally uses a `BehaviorSubject<T | NO_VALUE>` for the cache (so invalidation can clear it cleanly without emitting a sentinel to consumers) and a shared driver pipeline gated by `data$`'s ref count. The scaffold's `WidgetsService` becomes a thin factory wiring `_auth.userChange$` as the invalidation signal and a single shared poll subject.

**Tech Stack:** Angular 17+, RxJS 7+, TypeScript, Jest (`fakeAsync`/`tick`), `@theseam/ui-common/testing` `TickHelper`. Two repos: `TheSeam.UiCommon` (primitive) and the scaffold `theseam-scaf` (consumer). UI-common already has a feature branch `marklb/widget-refreshable`. Scaffold is on `feature/markb/scaffold`.

**Reference:** `docs/superpowers/specs/2026-04-25-refreshable-redesign-design.md` in this repo.

---

## Phase A — `Refreshable<T>` in ui-common

All Phase A tasks operate in `c:/Users/mberry/dev_home/git/TheSeam.UiCommon` on branch `marklb/widget-refreshable`.

Run tests with:

```bash
npm test -- refreshable.spec.ts
```

Run lint with:

```bash
npm run lint
```

Build the library with:

```bash
npm run build:ui-common
```

### Task A1: Reset `refreshable.ts` to skeleton

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`

(No spec file is created in this task. The Jest config in this repo refuses empty suites, so the spec file is created by Task A2 when the first real test is added.)

- [ ] **Step 1: Replace `refreshable.ts` with skeleton**

Replace the entire contents of `projects/ui-common/utils/refreshable.ts` with:

```ts
import { Observable } from 'rxjs'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

export class Refreshable<T> {
  public readonly data$: Observable<T> = new Observable<T>()
  public readonly loading$: Observable<boolean> = new Observable<boolean>()
  public readonly initialized$: Observable<boolean> = new Observable<boolean>()

  constructor(opts: RefreshableOptions<T>) {
    void opts
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
```

`void opts` is a deliberate statement that consumes the parameter. It satisfies both `@typescript-eslint/no-unused-vars` (the param is used) and `@typescript-eslint/no-useless-constructor` (the constructor body is non-empty), without needing an `eslint-disable` comment.

- [ ] **Step 2: Verify lint clean**

```bash
npm run lint
```

Expected: no errors related to `refreshable.ts`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts
git commit -m "refactor(refreshable): reset to skeleton ahead of redesign

The old Refreshable class is unused and is being replaced by a generic
primitive with invalidate\$/poll\$ inputs. Skeleton lands first so each
behavior can be added test-first. The spec file is created by Task A2
along with the first real test (Jest in this repo refuses empty suites)."
```

---

### Task A2: Lazy activation + first-subscribe triggers `action()`

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Create: `projects/ui-common/utils/refreshable.spec.ts`

- [ ] **Step 1: Create the spec file with the first failing tests**

Create `projects/ui-common/utils/refreshable.spec.ts` with:

```ts
import { fakeAsync, tick } from '@angular/core/testing'
import { Subject, of, throwError } from 'rxjs'

import { Refreshable } from './refreshable'

describe('Refreshable', () => {
  it('does not call action() until data$ has a subscriber', () => {
    const action = jest.fn(() => of(1))
    new Refreshable<number>({ action })
    expect(action).not.toHaveBeenCalled()
  })

  it('calls action() on first data$ subscribe and emits the value', fakeAsync(() => {
    const action = jest.fn(() => of(42))
    const r = new Refreshable<number>({ action })

    let received: number | undefined
    r.data$.subscribe((v) => (received = v))
    tick(0)

    expect(action).toHaveBeenCalledTimes(1)
    expect(received).toBe(42)
  }))
})
```

Note: `Subject` and `throwError` are imported even though they aren't used in this task's tests. They're used by tests added in subsequent tasks (A3 onward) and importing them upfront avoids re-touching the import block on every task. If your linter flags unused imports, remove the unused ones now and re-add them when needed in their respective tasks.

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm test -- refreshable.spec.ts
```

Expected: first test passes (the skeleton's `data$` is a never-emitting Observable, so `action` is never called — actually the laziness test passes vacuously). The second test fails because `data$` doesn't trigger `action` and never emits.

- [ ] **Step 3: Implement minimal driver**

Replace the contents of `projects/ui-common/utils/refreshable.ts` with:

```ts
import { defer, Observable } from 'rxjs'
import { switchMap, take } from 'rxjs/operators'
import { of } from 'rxjs'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

export class Refreshable<T> {
  public readonly data$: Observable<T>
  public readonly loading$: Observable<boolean> = new Observable<boolean>()
  public readonly initialized$: Observable<boolean> = new Observable<boolean>()

  constructor(opts: RefreshableOptions<T>) {
    const { action } = opts
    this.data$ = defer(() => of(undefined).pipe(switchMap(() => action()), take(1)))
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
```

- [ ] **Step 4: Run tests, verify both pass**

```bash
npm test -- refreshable.spec.ts
```

Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): lazy activation and first-subscribe fetch"
```

---

### Task A3: `loading$` and `initialized$` semantics on first fetch

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to the spec:

```ts
  it('loading$ defaults to false and does not flip when subscribed alone', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    const seen: boolean[] = []
    r.loading$.subscribe((v) => seen.push(v))
    tick(100)

    expect(action).not.toHaveBeenCalled()
    expect(seen).toEqual([false])
  }))

  it('initialized$ defaults to false and does not flip when subscribed alone', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    const seen: boolean[] = []
    r.initialized$.subscribe((v) => seen.push(v))
    tick(100)

    expect(action).not.toHaveBeenCalled()
    expect(seen).toEqual([false])
  }))

  it('loading$ flips true while action is in flight, then false on emission', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const r = new Refreshable<number>({ action: () => inner$ })

    const loading: boolean[] = []
    r.loading$.subscribe((v) => loading.push(v))
    r.data$.subscribe()
    tick(0)

    expect(loading).toEqual([false, true])

    inner$.next(7)
    tick(0)

    expect(loading).toEqual([false, true, false])
  }))

  it('initialized$ becomes true on first emission and stays true', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const r = new Refreshable<number>({ action: () => inner$ })

    const init: boolean[] = []
    r.initialized$.subscribe((v) => init.push(v))
    r.data$.subscribe()
    tick(0)

    expect(init).toEqual([false])

    inner$.next(7)
    tick(0)

    expect(init).toEqual([false, true])
  }))
```

- [ ] **Step 2: Run tests, verify failures**

```bash
npm test -- refreshable.spec.ts
```

Expected: laziness/default tests for the new observables fail because `loading$` and `initialized$` are empty `Observable<>()` (never emit). Loading-flip and initialized-flip tests fail for the same reason.

- [ ] **Step 3: Replace implementation**

Replace `projects/ui-common/utils/refreshable.ts` contents with:

```ts
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

const NO_VALUE: unique symbol = Symbol('refreshable.no-value')
type Cached<T> = T | typeof NO_VALUE

export class Refreshable<T> {
  private readonly _refresh$ = new Subject<void>()
  private readonly _cache$ = new BehaviorSubject<Cached<T>>(NO_VALUE)
  private readonly _loading$ = new BehaviorSubject<boolean>(false)
  private _dataSubCount = 0

  public readonly loading$: Observable<boolean> = this._loading$.pipe(
    distinctUntilChanged(),
  )

  public readonly initialized$: Observable<boolean> = this._cache$.pipe(
    map((v) => v !== NO_VALUE),
    distinctUntilChanged(),
  )

  public readonly data$: Observable<T>

  constructor(opts: RefreshableOptions<T>) {
    const { action } = opts

    const driver$ = merge(this._refresh$, EMPTY).pipe(
      startWith(undefined as unknown),
      tap(() => this._loading$.next(true)),
      switchMap(() => action()),
      tap({
        next: (v) => {
          this._cache$.next(v)
          this._loading$.next(false)
        },
        error: () => this._loading$.next(false),
      }),
      share({ resetOnRefCountZero: true, resetOnComplete: true, resetOnError: true }),
    )

    this.data$ = new Observable<T>((subscriber) => {
      this._dataSubCount++
      const driverSub = driver$.subscribe({
        error: (e) => subscriber.error(e),
      })
      const cacheSub = this._cache$
        .pipe(filter((v): v is T => v !== NO_VALUE))
        .subscribe(subscriber)
      return () => {
        cacheSub.unsubscribe()
        driverSub.unsubscribe()
        this._dataSubCount--
        if (this._dataSubCount === 0) {
          this._cache$.next(NO_VALUE)
          this._loading$.next(false)
        }
      }
    })
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
```

The `new Observable` constructor (rather than `defer`) plus manual `_dataSubCount` lets us:

1. Propagate driver errors to each `data$` subscriber individually.
2. Centralize refcount-zero cleanup in one place — the cache and `_loading$` reset only when the *last* `data$` subscriber leaves, not on every share-source teardown event (which would over-fire on errors and complicate the contract).

- [ ] **Step 4: Run tests, verify all four new tests + the two previous tests pass**

```bash
npm test -- refreshable.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): add loading\$ and initialized\$ outputs"
```

---

### Task A4: `refresh()` triggers a re-fetch

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

- [ ] **Step 1: Add failing test**

Append to the spec:

```ts
  it('refresh() runs action() again and emits the new value', fakeAsync(() => {
    let counter = 0
    const r = new Refreshable<number>({ action: () => of(++counter) })

    const seen: number[] = []
    r.data$.subscribe((v) => seen.push(v))
    tick(0)

    expect(seen).toEqual([1])

    r.refresh()
    tick(0)

    expect(seen).toEqual([1, 2])
  }))
```

- [ ] **Step 2: Run, verify failure**

```bash
npm test -- refreshable.spec.ts
```

Expected: fails — `refresh()` is a no-op and `seen` stays at `[1]`.

- [ ] **Step 3: Implement `refresh()`**

In `projects/ui-common/utils/refreshable.ts`, replace the `refresh()` method body:

```ts
  public refresh(): void {
    this._refresh$.next()
  }
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test -- refreshable.spec.ts
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): implement refresh() method"
```

---

### Task A5: `poll$` triggers re-fetch (does not clear cache)

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

- [ ] **Step 1: Add failing test**

Append to the spec:

```ts
  it('poll\$ tick triggers action() and emits the new value without clearing cache', fakeAsync(() => {
    let counter = 0
    const poll$ = new Subject<void>()
    const r = new Refreshable<number>({
      action: () => of(++counter),
      poll$,
    })

    const data: number[] = []
    const init: boolean[] = []
    r.initialized$.subscribe((v) => init.push(v))
    r.data$.subscribe((v) => data.push(v))
    tick(0)

    expect(data).toEqual([1])
    expect(init).toEqual([false, true])

    poll$.next()
    tick(0)

    expect(data).toEqual([1, 2])
    // initialized\$ does NOT flip back to false on poll
    expect(init).toEqual([false, true])
  }))
```

- [ ] **Step 2: Run, verify failure**

Expected: fails — current driver only listens to `_refresh$`, not `poll$`.

- [ ] **Step 3: Wire `poll$` into the driver**

In `projects/ui-common/utils/refreshable.ts`, in the constructor, replace the `driver$` `merge(...)` line:

```ts
    const driver$ = merge(this._refresh$, opts.poll$ ?? EMPTY).pipe(
```

- [ ] **Step 4: Run, verify pass**

Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): wire poll\$ trigger"
```

---

### Task A6: `invalidate$` clears cache and re-fetches; late subscriber sees no stale value

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

- [ ] **Step 1: Add failing tests**

Append to the spec:

```ts
  it('invalidate\$ tick flips initialized\$ to false until new value lands', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const invalidate$ = new Subject<void>()
    const r = new Refreshable<number>({
      action: () => inner$.asObservable(),
      invalidate$,
    })

    const init: boolean[] = []
    r.initialized$.subscribe((v) => init.push(v))
    r.data$.subscribe()
    tick(0)
    inner$.next(1)
    tick(0)

    expect(init).toEqual([false, true])

    invalidate$.next()
    tick(0)

    expect(init).toEqual([false, true, false])

    inner$.next(2)
    tick(0)

    expect(init).toEqual([false, true, false, true])
  }))

  it('late subscriber arriving after invalidate\$ does NOT see the stale cached value', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const invalidate$ = new Subject<void>()
    const r = new Refreshable<number>({
      action: () => inner$.asObservable(),
      invalidate$,
    })

    // First subscriber holds the source open across the invalidate.
    const heldOpen: number[] = []
    const heldOpenSub = r.data$.subscribe((v) => heldOpen.push(v))
    tick(0)
    inner$.next(1)
    tick(0)

    expect(heldOpen).toEqual([1])

    invalidate$.next()
    tick(0)

    // Late subscriber after invalidate, before new value lands.
    const late: number[] = []
    r.data$.subscribe((v) => late.push(v))
    tick(0)
    expect(late).toEqual([])

    inner$.next(2)
    tick(0)
    expect(late).toEqual([2])
    expect(heldOpen).toEqual([1, 2])

    heldOpenSub.unsubscribe()
  }))
```

- [ ] **Step 2: Run, verify failures**

Expected: fails — `invalidate$` is unwired; the cache is not cleared on its emission.

- [ ] **Step 3: Wire `invalidate$` and clear the cache on its tick**

In `projects/ui-common/utils/refreshable.ts`, locate the existing `const driver$ = merge(...)` block (the one currently passing `this._refresh$` and `opts.poll$ ?? EMPTY` into `merge`). Replace that **entire block** (from `const driver$` through the closing `)` of `share({...})`) with the following two declarations:

```ts
    const invalidateSig$ = (opts.invalidate$ ?? EMPTY).pipe(
      tap(() => this._cache$.next(NO_VALUE)),
    )

    const driver$ = merge(
      this._refresh$,
      opts.poll$ ?? EMPTY,
      invalidateSig$,
    ).pipe(
      startWith(undefined as unknown),
      tap(() => this._loading$.next(true)),
      switchMap(() => action()),
      tap({
        next: (v) => {
          this._cache$.next(v)
          this._loading$.next(false)
        },
        error: () => this._loading$.next(false),
      }),
      share({ resetOnRefCountZero: true, resetOnComplete: true, resetOnError: true }),
    )
```

Note: there is no `finalize` operator in the driver pipeline — refcount-zero cleanup lives in the `data$` `new Observable` teardown function (set up in Task A3) and stays there.

- [ ] **Step 4: Run, verify pass**

Expected: all 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): wire invalidate\$ with cache clear"
```

---

### Task A7: Multicast (concurrent subscribers share one in-flight `action()`)

**Files:**
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

(Implementation already supports this via `share({...})` — this task only verifies and locks it in.)

- [ ] **Step 1: Add test**

Append to the spec:

```ts
  it('multiple concurrent data\$ subscribers share one action() invocation', fakeAsync(() => {
    const action = jest.fn(() => of(99))
    const r = new Refreshable<number>({ action })

    const a: number[] = []
    const b: number[] = []
    r.data$.subscribe((v) => a.push(v))
    r.data$.subscribe((v) => b.push(v))
    tick(0)

    expect(action).toHaveBeenCalledTimes(1)
    expect(a).toEqual([99])
    expect(b).toEqual([99])
  }))
```

- [ ] **Step 2: Run, verify pass**

```bash
npm test -- refreshable.spec.ts
```

Expected: pass on first run (no impl change needed).

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/utils/refreshable.spec.ts
git commit -m "test(refreshable): lock in multicast behavior"
```

---

### Task A8: Switch semantics, coalescing, refcount-zero reset, passive observers, errors

**Files:**
- Modify: `projects/ui-common/utils/refreshable.ts`
- Modify: `projects/ui-common/utils/refreshable.spec.ts`

This task bundles the remaining behaviors. They share implementation surface (`auditTime(0)` for coalescing, `share({ resetOnRefCountZero: true })` for reset, `tap({ error })` for error handling), and several already pass with the current impl — the tests here lock them in.

- [ ] **Step 1: Add failing tests for switch, coalescing, refcount-zero, passive, errors**

Append to the spec:

```ts
  it('switchMap cancels in-flight action when a new trigger fires', fakeAsync(() => {
    const subjects: Subject<number>[] = []
    const action = jest.fn(() => {
      const s = new Subject<number>()
      subjects.push(s)
      return s.asObservable()
    })
    const r = new Refreshable<number>({ action })

    const seen: number[] = []
    r.data$.subscribe((v) => seen.push(v))
    tick(0)

    expect(subjects.length).toBe(1)
    expect(subjects[0].observed).toBe(true)

    r.refresh()
    tick(0)

    // Original action's inner stream should have been unsubscribed by switchMap.
    expect(subjects.length).toBe(2)
    expect(subjects[0].observed).toBe(false)
    expect(subjects[1].observed).toBe(true)

    // Late emission from the cancelled inner is ignored.
    subjects[0].next(111)
    subjects[1].next(222)
    tick(0)

    expect(seen).toEqual([222])
  }))

  it('coalesces simultaneous triggers into a single action() call', fakeAsync(() => {
    const poll$ = new Subject<void>()
    const invalidate$ = new Subject<void>()
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action, poll$, invalidate$ })

    r.data$.subscribe()
    tick(0)
    expect(action).toHaveBeenCalledTimes(1)

    poll$.next()
    invalidate$.next()
    r.refresh()
    tick(0)

    // Implementation note: coalescing here relies on auditTime(0) added below.
    expect(action).toHaveBeenCalledTimes(2)
  }))

  it('clears cache and tears down driver when data\$ refcount reaches zero', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    const seen: boolean[] = []
    r.initialized$.subscribe((v) => seen.push(v))

    const sub = r.data$.subscribe()
    tick(0)
    expect(action).toHaveBeenCalledTimes(1)
    expect(seen).toEqual([false, true])

    sub.unsubscribe()
    tick(0)
    expect(seen).toEqual([false, true, false])

    // New subscriber starts cold.
    r.data$.subscribe()
    tick(0)
    expect(action).toHaveBeenCalledTimes(2)
    expect(seen).toEqual([false, true, false, true])
  }))

  it('subscribing to loading\$ or initialized\$ alone does not call action()', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    r.loading$.subscribe()
    r.initialized$.subscribe()
    tick(100)

    expect(action).not.toHaveBeenCalled()
  }))

  it('error from action() propagates to data\$ and resets loading\$', fakeAsync(() => {
    const err = new Error('boom')
    const r = new Refreshable<number>({ action: () => throwError(() => err) })

    const loading: boolean[] = []
    r.loading$.subscribe((v) => loading.push(v))

    let caught: unknown
    r.data$.subscribe({
      next: () => undefined,
      error: (e) => (caught = e),
    })
    tick(0)

    expect(caught).toBe(err)
    expect(loading).toEqual([false, true, false])
  }))
```

- [ ] **Step 2: Run, see which fail**

```bash
npm test -- refreshable.spec.ts
```

Expected: switch / refcount-zero / passive / error tests pass. The coalescing test fails because `auditTime(0)` is not yet in the pipeline (multiple synchronous triggers each invoke action separately). If the error test fails because the error reaches the driver's `share` (which has `resetOnError: true`) and propagates incorrectly, the next step covers it.

- [ ] **Step 3: Add `auditTime(0)` to the driver pipeline**

In `projects/ui-common/utils/refreshable.ts`, in the `driver$` pipeline, add `auditTime(0)` between `startWith` and `tap(() => this._loading$.next(true))`. The full driver block (replacing the one set in Task A6) becomes:

```ts
    const driver$ = merge(
      this._refresh$,
      opts.poll$ ?? EMPTY,
      invalidateSig$,
    ).pipe(
      startWith(undefined as unknown),
      auditTime(0),
      tap(() => this._loading$.next(true)),
      switchMap(() => action()),
      tap({
        next: (v) => {
          this._cache$.next(v)
          this._loading$.next(false)
        },
        error: () => this._loading$.next(false),
      }),
      share({ resetOnRefCountZero: true, resetOnComplete: true, resetOnError: true }),
    )
```

Add `auditTime` to the rxjs/operators imports at the top of the file. The full import block becomes:

```ts
import {
  auditTime,
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'
```

- [ ] **Step 4: Run, verify all pass**

```bash
npm test -- refreshable.spec.ts
```

Expected: all 15 tests pass. Specifically: the coalescing test that previously logged `action` calls of 3 should now log 2 (one initial subscribe call plus one coalesced trigger).

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/refreshable.ts projects/ui-common/utils/refreshable.spec.ts
git commit -m "feat(refreshable): switch semantics, coalescing, refcount-zero, error propagation"
```

---

### Task A9: Verify export, build, and lint

**Files:**
- Read: `projects/ui-common/utils/public-api.ts` (verify export still present)
- Build, lint, full test sweep.

- [ ] **Step 1: Verify the existing barrel export still re-exports `Refreshable` and `RefreshableOptions`**

Open `projects/ui-common/utils/public-api.ts` and confirm the line:

```ts
export * from './refreshable'
```

is still present. (No edit needed — the export was preserved across the rewrite. This step is a verification gate.)

- [ ] **Step 2: Run full ui-common test suite to catch any cross-file regressions**

```bash
npm test
```

Expected: all tests pass. The old `Refreshable` had no callers, so no other suites should fail.

- [ ] **Step 3: Build the library to surface any type errors**

```bash
npm run build:ui-common
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Lint**

```bash
npm run lint
```

Expected: no errors. If lint flags the `_opts` no-unused-vars guard added earlier (it was removed in Task A3), this step ensures no leftover suppressions remain.

- [ ] **Step 5: Commit (only if any non-functional fixes were needed in steps 2–4)**

If there were no fixes, skip this step. Otherwise:

```bash
git add -A
git commit -m "chore(refreshable): build and lint cleanups"
```

---

## Phase B — Publish ui-common (manual, by user)

This phase is gated on a maintainer action and cannot be performed by an automation worker.

### Task B1: Publish ui-common build

**Owner:** Mark (or any maintainer with publish permissions to the npm registry / GitHub Actions release pipeline).

- [ ] **Step 1:** Push `marklb/widget-refreshable` to the remote and open a PR against the ui-common default branch.
- [ ] **Step 2:** Merge the PR (squash or merge per repo convention).
- [ ] **Step 3:** Trigger the GitHub Actions release pipeline that produces a published `@theseam/ui-common` package version.
- [ ] **Step 4:** Note the published version number (e.g. `X.Y.Z`) for use in Phase C.

Until this task is complete, Phase C cannot build successfully. Phase C source edits can be staged ahead of time (e.g. on a draft PR), but must not be merged or built locally until B1 lands.

---

## Phase C — Scaffold migration

All Phase C tasks operate in `c:/Users/mberry/dev_home/tmp/New folder (26)/theseam-scaf` on branch `feature/markb/scaffold`.

Run tests with:

```bash
npm test
```

Build with:

```bash
npm run build:local
```

### Task C1: Bump `@theseam/ui-common` to the new published version

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (auto)

- [ ] **Step 1: Update the dependency version**

In `package.json`, find the `"@theseam/ui-common"` entry under `dependencies` and update it to the version published in Task B1 (e.g. `"X.Y.Z"`).

- [ ] **Step 2: Install**

```bash
npm install
```

Expected: `package-lock.json` updates; no install errors.

- [ ] **Step 3: Verify the new `Refreshable` is importable**

```bash
node -e "console.log(Object.keys(require('@theseam/ui-common/utils')))" | grep -i refreshable
```

Expected: output contains `Refreshable` and `RefreshableOptions`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): bump @theseam/ui-common to <X.Y.Z>

Pulls in the redesigned Refreshable<T> primitive used by the
incoming WidgetsService refactor."
```

---

### Task C2: Rewrite `WidgetsService`

**Files:**
- Modify: `src/app/modules/widgets/widgets.service.ts`

- [ ] **Step 1: Replace the entire file**

Replace the contents of `src/app/modules/widgets/widgets.service.ts` with:

```ts
import { inject, Injectable } from '@angular/core'
import { interval, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'

import { ApiQuickFactService, ApiUserService } from '@lib/api'
import { ApiDocumentService } from '@lib/api/services/api-document.service'
import { Refreshable, notNullOrUndefined } from '@theseam/ui-common/utils'

import { AuthService } from '@app/services/auth.service'

@Injectable({ providedIn: 'root' })
export class WidgetsService {
  private readonly _auth = inject(AuthService)
  private readonly _documentService = inject(ApiDocumentService)
  private readonly _userService = inject(ApiUserService)
  private readonly _quickFactService = inject(ApiQuickFactService)

  private readonly _pollingInterval = 3 * 60 * 1000
  private readonly _poll$ = new Subject<void>()

  public readonly userName$: Observable<string> = this._auth.authData$.pipe(
    map((authData) => authData && authData.userName),
    filter(notNullOrUndefined),
    distinctUntilChanged(),
  )

  public readonly documentCount = this._source(() =>
    this._documentService.getDocumentCount(),
  )
  public readonly documents = this._source(() =>
    this._documentService.getDocumentsForWidget(),
  )
  public readonly usersCount = this._source(() => this._userService.usersCount())
  public readonly quickFacts = this._source(() =>
    this._quickFactService.getActiveQuickFacts(),
  )

  constructor() {
    interval(this._pollingInterval).subscribe(() => this._poll$.next())
  }

  public pollingInterval(): number {
    return this._pollingInterval
  }

  /** Tick all subscribed sources. Prefer per-source `.refresh()` when possible. */
  public refreshAll(): void {
    this._poll$.next()
  }

  private _source<R>(action: () => Observable<R>): Refreshable<R> {
    return new Refreshable<R>({
      action,
      invalidate$: this._auth.userChange$,
      poll$: this._poll$,
    })
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: errors only from the three widget components and stories that still use the old API. (They are migrated in tasks C3–C5.) No errors from `widgets.service.ts` itself.

- [ ] **Step 3: Do not commit yet**

Hold the commit until widgets are migrated (Task C5), since the project will not build until then.

---

### Task C3: Migrate `widget-users.component`

**Files:**
- Modify: `src/app/modules/widgets/widget-users/widget-users.component.ts`
- Modify: `src/app/modules/widgets/widget-users/widget-users.component.html`
- Modify: `src/app/modules/widgets/widget-users/widget-users.stories.ts`

- [ ] **Step 1: Update component**

Replace the contents of `widget-users.component.ts` with:

```ts
import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { map } from 'rxjs/operators'

import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { TheSeamWidgetModule } from '@theseam/ui-common/widget'

import { WidgetsService } from '../widgets.service'

@Component({
  selector: 'app-widget-users',
  templateUrl: './widget-users.component.html',
  styleUrls: ['./widget-users.component.scss'],
  imports: [CommonModule, TheSeamWidgetModule],
})
export class WidgetUsersComponent {
  private readonly _widgets = inject(WidgetsService)
  private readonly _source = this._widgets.usersCount

  readonly _headerIcon = faUsers
  readonly _tileIcon = 'assets/images/icons/icon-user-members.svg'

  readonly _initialized$ = this._source.initialized$
  readonly _userCount$ = this._source.data$.pipe(
    map((count) =>
      count > 0
        ? `${count.toLocaleString()} active ${count > 1 ? 'users' : 'user'}`
        : undefined,
    ),
  )
}
```

- [ ] **Step 2: Verify the template still binds the same way**

Open `widget-users.component.html` and confirm it already uses `[loading]="!(_initialized$ | async)"` (no edit needed). If a future change wants a "refreshing" indicator, it can bind to `_source.loading$` — out of scope for this task.

- [ ] **Step 3: Update storybook stub to expose a `Refreshable`-shaped object**

Replace the contents of `widget-users.stories.ts` with:

```ts
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideLocationMocks } from '@angular/common/testing'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { Refreshable } from '@theseam/ui-common/utils'

import { WidgetsService } from '../widgets.service'
import { WidgetUsersComponent } from './widget-users.component'

class WidgetsServiceStub implements Partial<WidgetsService> {
  public readonly usersCount = {
    data$: of(5),
    loading$: of(false),
    initialized$: of(true),
    refresh: () => undefined,
  } as unknown as Refreshable<number>
}

const meta: Meta = {
  title: 'Widget/Users',
  component: WidgetUsersComponent,
  decorators: [
    applicationConfig({
      providers: [provideLocationMocks(), provideRouter([])],
    }),
    moduleMetadata({
      providers: [{ provide: WidgetsService, useClass: WidgetsServiceStub }],
    }),
    componentWrapperDecorator(
      (story) => `<div style="max-width: 450px;" class="p-4">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<WidgetUsersComponent>

export const Basic: Story = {}
```

- [ ] **Step 4: Hold commit until C5**

---

### Task C4: Migrate `widget-documents.component`

**Files:**
- Modify: `src/app/modules/widgets/widget-documents/widget-documents.component.ts`
- Modify: `src/app/modules/widgets/widget-documents/widget-documents.stories.ts`

- [ ] **Step 1: Update component**

Replace the contents of `widget-documents.component.ts` with:

```ts
import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { map, switchMap, tap } from 'rxjs/operators'

import {
  faFileUpload,
  faLayerGroup,
  faListAlt,
} from '@fortawesome/free-solid-svg-icons'
import { faFiles } from '@fortawesome/pro-solid-svg-icons'
import {
  fileExtensionIcon,
  SeamIcon,
  TheSeamIconModule,
} from '@theseam/ui-common/icon'
import { Modal, TheSeamModalModule } from '@theseam/ui-common/modal'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamWidgetModule } from '@theseam/ui-common/widget'

import { ApiDocument, Permission } from '@lib/api'
import { PermissionService } from '@app/services/permission.service'

import { WidgetsService } from '../widgets.service'

export interface DocumentWidgetRecord {
  name: string
  documentIcon?: SeamIcon | null
  documentUrl?: string | null
}

@Component({
  selector: 'app-widget-documents',
  templateUrl: './widget-documents.component.html',
  styleUrls: ['./widget-documents.component.scss'],
  imports: [
    CommonModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamWidgetModule,
    TheSeamModalModule,
  ],
})
export class WidgetDocumentsComponent {
  private readonly _widget = inject(WidgetsService)
  private readonly _modal = inject(Modal)
  private readonly _permission = inject(PermissionService)

  private readonly _documents = this._widget.documents
  private readonly _documentCount = this._widget.documentCount

  readonly _headerIcon = faFiles
  readonly _btnIcnUpload = faFileUpload
  readonly _btnIcnLayerGroup = faLayerGroup
  readonly _btnIcnListAlt = faListAlt

  readonly _initialized$ = this._documents.initialized$

  readonly _rows$ = this._documents.data$.pipe(
    map((documents) => documents.map((d) => this._mapRowData(d))),
  )

  readonly _docsCount$ = this._documentCount.data$

  readonly _canUploadDocument$ = this._permission.hasPermission(
    Permission.CanUploadDocument,
  )

  readonly _canManageCategories$ = this._permission.hasPermission(
    Permission.CanManageDocumentCategories,
  )

  readonly _displayedColumns = [
    {
      prop: 'documentIcon',
      name: '',
      cellType: 'icon',
      cellTypeConfig: {
        type: 'icon',
        iconClass: 'text-primary',
        styles: 'max-width: 40px; width: 40px; min-width: 40px;',
        action: {
          type: 'link',
          link: { type: 'jexl', expr: 'row.documentUrl' },
          encrypted: true,
          target: '_blank',
          asset: true,
          detectMimeContent: true,
        },
      },
    },
    { prop: 'name', name: 'Name' },
  ]

  private _mapRowData(item: ApiDocument): DocumentWidgetRecord {
    return {
      name: item.name,
      documentIcon: fileExtensionIcon(item.fileExtension),
      documentUrl: item.url,
    }
  }

  _openUploadDocument() {
    this._modal
      .openFromLazyComponent('document-upload-modal')
      .pipe(
        switchMap((moduleRef) =>
          moduleRef
            .afterClosed()
            .pipe(tap(() => this._documents.refresh())),
        ),
      )
      .subscribe()
  }
}
```

- [ ] **Step 2: Update storybook stub**

Replace the contents of `widget-documents.stories.ts` with the analog of the widget-users stub, adapted for the documents widget. Open `widget-documents.stories.ts` first to see what mocks it currently provides, then replace `usersCount`/`refreshDocuments`/etc.-style mocks with `Refreshable`-shaped fields:

```ts
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideLocationMocks } from '@angular/common/testing'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { Refreshable } from '@theseam/ui-common/utils'
import { ApiDocument } from '@lib/api'

import { WidgetsService } from '../widgets.service'
import { WidgetDocumentsComponent } from './widget-documents.component'

const sampleDocs: ApiDocument[] = []

class WidgetsServiceStub implements Partial<WidgetsService> {
  public readonly documents = {
    data$: of(sampleDocs),
    loading$: of(false),
    initialized$: of(true),
    refresh: () => undefined,
  } as unknown as Refreshable<ApiDocument[]>

  public readonly documentCount = {
    data$: of(sampleDocs.length),
    loading$: of(false),
    initialized$: of(true),
    refresh: () => undefined,
  } as unknown as Refreshable<number>
}

const meta: Meta = {
  title: 'Widget/Documents',
  component: WidgetDocumentsComponent,
  decorators: [
    applicationConfig({
      providers: [provideLocationMocks(), provideRouter([])],
    }),
    moduleMetadata({
      providers: [{ provide: WidgetsService, useClass: WidgetsServiceStub }],
    }),
    componentWrapperDecorator(
      (story) => `<div style="max-width: 450px;" class="p-4">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<WidgetDocumentsComponent>

export const Basic: Story = {}
```

If the existing `widget-documents.stories.ts` has additional decorators, story exports, or providers (e.g. `Modal`, `PermissionService`), preserve them in the new file — only the `WidgetsServiceStub` shape changes.

- [ ] **Step 3: Hold commit until C5**

---

### Task C5: Migrate `widget-quick-facts.component` and commit Phase C source changes

**Files:**
- Modify: `src/app/modules/widgets/widget-quick-facts/widget-quick-facts.component.ts`
- Modify: `src/app/modules/widgets/widget-quick-facts/widget-quick-facts.stories.ts`
- Commit all of Phase C's source edits.

- [ ] **Step 1: Update the component**

Replace the contents of `widget-quick-facts.component.ts` with:

```ts
import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TheSeamWidgetModule } from '@theseam/ui-common/widget'
import { TheSeamCarouselModule } from '@theseam/ui-common/carousel'

import { WidgetsService } from '../widgets.service'

@Component({
  selector: 'app-widget-quick-facts',
  templateUrl: './widget-quick-facts.component.html',
  styleUrls: ['./widget-quick-facts.component.scss'],
  imports: [CommonModule, TheSeamWidgetModule, TheSeamCarouselModule],
})
export class WidgetQuickFactsComponent {
  private readonly _widgets = inject(WidgetsService)

  readonly _headerIcon = 'assets/images/icons/lightbulb.svg'

  readonly _quickFacts$ = this._widgets.quickFacts.data$
}
```

Note the local `shareReplay({ bufferSize: 1, refCount: true })` is removed — the primitive already multicasts and replays a buffer of 1.

- [ ] **Step 2: Update the stories file analogously**

Open `widget-quick-facts.stories.ts`, then update the stub:

```ts
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideLocationMocks } from '@angular/common/testing'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { Refreshable } from '@theseam/ui-common/utils'
import { ApiQuickFactModel } from '@lib/api'

import { WidgetsService } from '../widgets.service'
import { WidgetQuickFactsComponent } from './widget-quick-facts.component'

const sampleQuickFacts: ApiQuickFactModel[] = []

class WidgetsServiceStub implements Partial<WidgetsService> {
  public readonly quickFacts = {
    data$: of(sampleQuickFacts),
    loading$: of(false),
    initialized$: of(true),
    refresh: () => undefined,
  } as unknown as Refreshable<ApiQuickFactModel[]>
}

const meta: Meta = {
  title: 'Widget/QuickFacts',
  component: WidgetQuickFactsComponent,
  decorators: [
    applicationConfig({
      providers: [provideLocationMocks(), provideRouter([])],
    }),
    moduleMetadata({
      providers: [{ provide: WidgetsService, useClass: WidgetsServiceStub }],
    }),
    componentWrapperDecorator(
      (story) => `<div style="max-width: 450px;" class="p-4">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<WidgetQuickFactsComponent>

export const Basic: Story = {}
```

If the existing stories file has additional providers or decorators, preserve them.

- [ ] **Step 3: Run the scaffold's full test suite**

```bash
npm test
```

Expected: passes (no widget tests exist today, but if any are added they should pass).

- [ ] **Step 4: Run a local build**

```bash
npm run build:local
```

Expected: build succeeds with no TypeScript errors and no template errors.

- [ ] **Step 5: Commit all of Phase C's source edits**

```bash
git add src/app/modules/widgets/
git commit -m "refactor(widgets): adopt Refreshable<T> from ui-common

Replaces the per-source field+getter+refresh-method boilerplate in
WidgetsService with single-line declarations of Refreshable instances,
and updates widget components and stories to consume .data\$ /
.initialized\$ / .refresh() directly. The legacy refreshable() /
_refreshableObservable() / observe() methods are removed. User-change
invalidation and shared-poll cadence are now contracts of the primitive
rather than ad-hoc per-source wiring."
```

---

### Task C6: Smoke test in browser

**Files:** none (manual verification).

- [ ] **Step 1: Start the dev server**

```bash
npm start
```

- [ ] **Step 2: Open the dashboard in a browser** (default `http://localhost:4200`).

Verify each of the three widgets renders, shows real data (or its loading/empty state until backend responds), and the documents widget's upload flow still calls `refresh()` after the modal closes (data row count updates).

- [ ] **Step 3: Test impersonation if available**

If the auth flow supports impersonation (changing `_auth.userChange$`), trigger it and verify each widget reloads with the new user's data (and shows no flash of the previous user's values).

- [ ] **Step 4: Stop the dev server**

`Ctrl+C` in the terminal running `npm start`.

- [ ] **Step 5: No commit needed** — verification only.

---

## Self-review checklist (executor)

Before marking this plan complete:

- [ ] All Refreshable behaviors from the spec have a corresponding test in `refreshable.spec.ts`.
- [ ] `data$`, `loading$`, `initialized$`, `refresh()` names are consistent across the spec, plan, primitive, service, and widget components (no `pending$` left over from earlier brainstorming drafts).
- [ ] No widget component still references `_widgets.usersCount()` (method-call form), `_widgets.refreshUsersCount()`, or `BehaviorSubject<boolean>(false)` for `_initialized`.
- [ ] No code path imports the removed `tapFirst` from `refreshable.ts` (it was an internal dep of the old class; it remains in `utils/operators/tap-first.ts` but is no longer used by `refreshable.ts`).
- [ ] `npm run build:ui-common` succeeds in ui-common.
- [ ] `npm run build:local` succeeds in the scaffold against the published ui-common version.
