# Refreshable<T> Redesign & Widget Data Refactor

**Status:** Draft
**Date:** 2026-04-25
**Repos affected:** `TheSeam.UiCommon`, `TheSeam.*` scaffold (and downstream apps when they choose to adopt)

## Problem

Each Seam app's `WidgetsService` has grown into a large, repetitive registry. Cotton's version is ~1300 lines and ~50 widget data sources. For each source, the service holds a private `IRefreshableWorkaround<T>` field, an init line in the constructor, a public getter method, and a public refresh method — four touchpoints per source, mostly boilerplate.

The supporting primitives in the service (`refreshable()`, `_refreshableObservable()`, `observe()`) accumulated complexity across iterations and now contain dead inputs (`countFn`), an obsolete `done` flag, and overlapping user-change behavior between `refreshable()` (retrigger via ticker) and `observe()` (unsubscribe/resubscribe). The `observe()` mechanism only works because the apps' current auth flow re-navigates to the dashboard on user-change, destroying widgets. If that auth behavior changes, `observe()` is silently insufficient.

`projects/ui-common/utils/refreshable.ts` already contains a `Refreshable` class that was an earlier attempt at solving the same problem. It has known bugs and is currently unused, leaving a clean slate to redesign.

## Goals

- Replace the ad-hoc per-source boilerplate with a single primitive that captures the shared concerns (polling, manual refresh, user-change invalidation, sharing, lazy activation).
- Each widget data source declared in a single line on `WidgetsService`.
- The primitive lives in `ui-common` so future apps inherit it via the scaffold without a separate library migration.
- Eliminate stale-cache reads that occur during the gap between user-change and the new fetch landing.
- Remove the `observe()` user-change reset entirely; user-change handling becomes an internal concern of the primitive.

## Non-goals

- Migrating Cotton, Peanut, or any other downstream app's `WidgetsService`. Those teams adopt at their own pace once the primitive is published.
- Removing or deprecating `projects/ui-common/utils/polling-ticker.ts`. The new `Refreshable` does not use it, but it stays in place for any other consumers.
- Adding an error-state surface (`error$`, retry helpers). Errors propagate through `data$` as in plain RxJS. Most widgets are read-only display surfaces; recoverable errors are rare and can be added later without breaking the API.
- Replacing `WidgetsService` with NGXS or another state-management library.

## Architecture

Two units, with a clear boundary:

### Unit 1 — `Refreshable<T>` (in `projects/ui-common/utils/refreshable.ts`)

A generic primitive with no dependency on `AuthService` or any other app-specific service. Takes observables as constructor inputs. This replaces the existing class of the same name (which is unused and has known bugs).

Stays in `utils/` rather than `widget/` because the primitive is general-purpose: any feature that needs poll-driven, refreshable, user-invalidated data can use it.

### Unit 2 — App `WidgetsService` factory

Each app retains a `WidgetsService` whose role narrows to:

1. Owning the shared poll interval.
2. Wiring `_auth.userChange$` as the invalidation signal.
3. Exposing a private `_source(fn)` factory that constructs `Refreshable<T>` instances pre-wired with both signals.
4. Declaring each widget data source as a single-line public field initialized via `_source(...)`.
5. Exposing derived auth-driven observables (`userName$`, `userKind$`, etc.) that aren't refreshables — these stay as direct projections of `authData$`.

External code never instantiates `Refreshable` directly. All sources flow through the service factory, which guarantees the user-change and poll invariants are wired.

## `Refreshable<T>` API

### Constructor

```ts
new Refreshable<T>({
  action: () => Observable<T>,
  invalidate$?: Observable<unknown>,
  poll$?: Observable<unknown>,
})
```

- `action` — called to fetch a fresh value. Returns an observable that emits the value and (typically) completes.
- `invalidate$` — when it ticks, the cached value is cleared and a new `action()` is invoked. Subscribers that arrive after the tick but before the new value lands see no value (no flash of stale data).
- `poll$` — when it ticks, a new `action()` is invoked. Existing subscribers continue to see the previous cached value until the new one emits.

Both signal inputs are optional. A `Refreshable` with neither only fetches on first subscribe (and on `refresh()`).

### Public surface

- `data$: Observable<T>` — current value, multicast across subscribers (`ReplaySubject(1)` semantics, refcount-tracked).
- `loading$: Observable<boolean>` — `true` while an `action()` is in flight, `false` otherwise. Defaults to `false`.
- `initialized$: Observable<boolean>` — `false` initially and after any cache-clearing event; `true` after the first emission. Does not flip back to `false` on poll-driven refetches.
- `refresh(): void` — equivalent to a `poll$` tick. Triggers `action()` without clearing the cache.

### Behavior contract

- **Lazy.** No subscriptions to `invalidate$`, `poll$`, or `action()` form until `data$` has at least one subscriber. Creating a `Refreshable` that nothing observes is free.
- **Passive observers.** `loading$` and `initialized$` do **not** activate the inner pipeline when subscribed alone. They are read-only views into internal state. This lets a widget compose `loading$` from multiple sources without accidentally activating sources whose `data$` is never subscribed.
- **Shared.** Multiple concurrent subscribers to `data$` share one in-flight `action()` and one cached last value.
- **`poll$` / `refresh()` semantics.** Refetches without clearing the cache. Existing subscribers see the previous value until the new one emits. `loading$` flips `true` during the fetch. `initialized$` stays `true`.
- **`invalidate$` semantics.** Clears the cache and refetches. `initialized$` flips `false`. Subscribers arriving in the gap see no value yet (they wait for the new emission). Existing subscribers continue to see the previous value until the new one emits — **the primitive does not emit `undefined` or any sentinel**.
- **Coalescing.** Multiple triggers in the same microtask collapse to a single `action()` invocation (`auditTime(0)` internally).
- **Switch semantics.** A trigger fired while `action()` is still running cancels the in-flight observable (`switchMap`) and starts a new one. `loading$` stays `true` across the swap.
- **Refcount-zero reset.** When `data$` drops to zero subscribers, the inner pipeline tears down, the cache clears, and `initialized$` resets. The next subscriber starts cold.
- **Errors (v1).** If `action()` errors, the error propagates through `data$` to subscribers via the standard RxJS error channel. `loading$` emits `false`. Because errors are terminal for `data$` subscribers, the last subscriber tears down on error and the cache is cleared by the same teardown path used for refcount-zero reset, so `initialized$` flips to `false` as a side effect. There is no built-in retry, and the source instance does not auto-recover from an error: once errored, the same in-flight subscription cannot be revived by `refresh()`. Recovery requires re-subscription (which rebuilds the inner pipeline from scratch) or constructing a new `Refreshable`. A future non-terminal variant is noted in Open Questions.

### State table

| Event | `loading$` | `initialized$` |
|---|---|---|
| Created, no `data$` subscribers | `false` | `false` |
| Subscribing to `loading$`/`initialized$` only | `false` | `false` |
| First `data$` subscribe → before action runs | `true` | `false` |
| First emission | `false` | `true` |
| `poll$` tick / `refresh()` (with `data$` subscribed) | `true` | (stays `true`) |
| Emission after poll/refresh | `false` | `true` |
| `invalidate$` tick (with `data$` subscribed) | `true` | **`false`** |
| Emission after invalidate | `false` | `true` |
| Error from `action()` | `false` | `false` (last subscriber tears down) |
| All `data$` subscribers leave (refcount → 0) | `false` (reset) | `false` (reset) |

## Scaffold integration

### `WidgetsService` shape (after)

```ts
@Injectable({ providedIn: 'root' })
export class WidgetsService {
  private readonly _auth = inject(AuthService)
  private readonly _documentService = inject(ApiDocumentService)
  private readonly _userService = inject(ApiUserService)
  private readonly _quickFactService = inject(ApiQuickFactService)

  private readonly _pollingInterval = 3 * 60 * 1000
  private readonly _poll$ = new Subject<void>()

  readonly userName$: Observable<string> = this._auth.authData$.pipe(
    map(authData => authData && authData.userName),
    filter(notNullOrUndefined),
    distinctUntilChanged(),
  )

  readonly documentCount = this._source(() => this._documentService.getDocumentCount())
  readonly documents = this._source(() => this._documentService.getDocumentsForWidget())
  readonly usersCount = this._source(() => this._userService.usersCount())
  readonly quickFacts = this._source(() => this._quickFactService.getActiveQuickFacts())

  constructor() {
    interval(this._pollingInterval).subscribe(() => this._poll$.next())
  }

  pollingInterval(): number { return this._pollingInterval }

  /** Tick all subscribed sources. Prefer per-source `.refresh()` when possible. */
  refreshAll(): void { this._poll$.next() }

  private _source<T>(action: () => Observable<T>): Refreshable<T> {
    return new Refreshable<T>({
      action,
      invalidate$: this._auth.userChange$,
      poll$: this._poll$,
    })
  }
}
```

Notes:
- `_source` is `private` (the underscore matches the project convention for in-class-only API).
- `userName$` and similar derived auth-projections that are not refreshables stay as direct observables on the service.
- The shared `_poll$` Subject preserves today's "all sources refresh in lockstep" behavior. Keeping the existing semantics avoids any user-visible change in poll cadence.

### Widget consumer shape (after)

`widget-users.component.ts`:

```ts
export class WidgetUsersComponent {
  private readonly _widgets = inject(WidgetsService)
  private readonly _source = this._widgets.usersCount

  readonly _headerIcon = faUsers
  readonly _tileIcon = 'assets/images/icons/icon-user-members.svg'

  readonly _initialized$ = this._source.initialized$
  readonly _userCount$ = this._source.data$.pipe(
    map(count => count > 0
      ? `${count.toLocaleString()} active ${count > 1 ? 'users' : 'user'}`
      : undefined),
  )
}
```

Eliminated:
- The local `_initialized = new BehaviorSubject<boolean>(false)`.
- The `tap(() => setTimeout(() => this._initialized.next(true)))` workaround.

Template binding for the seam-widget loading input:
- `<seam-widget [loading]="!(_initialized$ | async)">` (unchanged in shape; the value source moves from a local subject to the primitive).
- Future "refresh-in-progress" indicator can bind to `loading$` directly.

### Migration mapping (per source)

| Today | After |
|---|---|
| `private readonly _xRefreshable: IRefreshableWorkaround<T>` | (removed) |
| `this._xRefreshable = this.refreshable(() => svc.x())` (in constructor) | `readonly x = this._source(() => svc.x())` (single line) |
| `public x(): Observable<T> { return this.observe(this._xRefreshable.data, 'x') }` | (removed) |
| `public refreshX(): void { this._xRefreshable.ticker.next() }` | (removed) |
| Consumer `this._widgets.x()` | `this._widgets.x.data$` |
| Consumer `this._widgets.refreshX()` | `this._widgets.x.refresh()` |

### Forward-compat: parametrized sources

Some downstream apps (e.g., Cotton's `userProducers(orgName)`) need a per-arg `Refreshable` that's lazily cached. The scaffold has none currently, so this is documented but not implemented.

When required, expose as a method that returns a `Refreshable<T>`, with internal caching:

```ts
private readonly _userProducersByOrg = new Map<string, Refreshable<IApiProducerModel[]>>()

userProducers(orgName?: string): Refreshable<IApiProducerModel[]> {
  if (!orgName) return this._userProducersDefault
  let r = this._userProducersByOrg.get(orgName)
  if (!r) {
    r = this._source(() => this._cottonSustainability.userProducers(orgName))
    this._userProducersByOrg.set(orgName, r)
  }
  return r
}
```

Static sources are fields; dynamic sources are methods that return a `Refreshable<T>`. Both styles coexist.

## Migration sequencing

The scaffold imports `@theseam/ui-common` as a published npm package, not via `npm link`. The local registry config has known issues and `npm link` is not currently working for ui-common. Therefore the change must roll out in this order:

1. Land `Refreshable<T>` redesign and tests on the ui-common branch.
2. Publish a ui-common build via the GitHub Actions release pipeline (action required from a maintainer with publish permissions — currently Mark).
3. Bump the scaffold's `@theseam/ui-common` dependency to the new published version.
4. Update the scaffold `WidgetsService` and widget consumers.

The scaffold-side code change can be staged ahead of publish (as a draft PR or a stash), but it cannot build until step 2 is complete.

## Testing

### `Refreshable<T>` (ui-common)

Unit tests covering:

- **Lazy activation:** creating a `Refreshable` with non-noop `action`, never subscribing to `data$` → `action` is never called.
- **First subscribe:** subscribing to `data$` → `action` called once, `loading$` is `true`, `initialized$` is `false`. After emission: `loading$` `false`, `initialized$` `true`, value emitted.
- **Multicast:** two concurrent subscribers to `data$` → `action` called once, both receive the value.
- **`poll$` tick:** existing subscriber sees old value, then new value; `loading$` flips, `initialized$` stays `true`.
- **`invalidate$` tick:** `initialized$` flips `false`; a subscriber arriving in the gap before the new emission receives only the new value (no stale value first).
- **Coalescing:** `invalidate$` and `poll$` ticks in the same microtask → a single `action` invocation.
- **Switch semantics:** trigger during in-flight action → in-flight observable unsubscribed, new one started.
- **Refcount-zero reset:** subscribe → unsubscribe → re-subscribe → cache cleared, `action` called again.
- **Passive observers:** subscribing to `loading$` or `initialized$` alone does not invoke `action`.
- **`refresh()`:** behaves identically to a `poll$` tick.

Use `fakeAsync`/`tick` and/or RxJS marble testing as appropriate.

### Scaffold `WidgetsService`

Smoke test that `_source(...)` wires `_auth.userChange$` and `_poll$` correctly: verify a `userChange$` emission causes the source's `initialized$` to flip `false` then `true` after the next `action` emission.

### Widget consumers

Existing widget tests in the scaffold (if any) updated to match new bindings. New behavior tests not required — the binding shape change is mechanical.

## Open questions / future work

- **Error recovery.** The current contract leaves `data$` in a terminal-error state if `action` errors. If we move to a non-terminal internal subject, `refresh()` could attempt recovery. Decision deferred until a downstream app reports a real need.
- **`ui-common/utils/polling-ticker.ts`.** Stays as-is for now. May be deprecated or removed in a future cleanup once we confirm no consumers.
- **Promotion of the `WidgetsService` factory shape.** If multiple apps end up writing the same boilerplate factory, consider extracting a generic `RefreshableSourceFactory` into ui-common. Premature today.
- **Cotton / Peanut / other-app migration.** Each is its own ticket, owned by the respective app team. The scaffold's migrated form is the reference.
