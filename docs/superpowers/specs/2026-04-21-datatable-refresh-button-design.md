# Datatable Refresh Button — Design

## Context

Each consuming app currently copies a local `datatable-refresh-btn.module.ts` that:

1. Defines a `DatatableRefreshBtnComponent` rendering a small `seamButton` with a sync icon.
2. Defines a `DatatableRefreshBtnDirective` (selector `seam-datatable`) that monkey-patches the datatable instance with a `__refreshPatch` property holding a `Subject<void>` and an observable.
3. Exports a `dtRefreshTrigger(dt)` helper that reads the patched property so REST components can subscribe to refresh requests.

The GraphQL helper `observeRowsWithGqlInputsHandling` in `projects/ui-common/graphql/datatable/datatable-helpers.ts` (lines 120–135) also reaches into `(dt as any).__refreshPatch.refreshTriggered` to refetch the query when the user clicks the button.

This design moves the feature into `@theseam/ui-common/datatable` as a proper, DI-based feature with no monkey-patching.

## Goals

- Provide a refresh button consumers drop into a `seam-datatable` with zero configuration.
- Give consumers a clean, declarative way to react to refresh requests (REST flow).
- Let the GraphQL helper observe refresh requests through honest Angular API instead of `(dt as any).__refreshPatch`.
- Avoid adding required parameters to `observeRowsWithGqlInputsHandling`.
- Avoid bloating `DatatableComponent` — the only additions are a one-line `providers` entry and a single output bound to an observable.

## Non-Goals

- Migrating consumer apps. The user will handle that separately.
- Removing the local `datatable-refresh-btn.module.ts` from any app.
- Refactoring `DatatableComponent` beyond the two minimal additions described.
- Supporting refresh-button placement outside a `seam-datatable` injection scope. (The button only makes sense inside one.)

## Architecture

### `DatatableRefreshService`

A small `@Injectable()` modeled on `DatatableColumnChangesService`.

```typescript
@Injectable()
export class DatatableRefreshService {
  private readonly _refreshSubject = new Subject<void>()

  readonly refreshRequested$: Observable<void> =
    this._refreshSubject.asObservable()

  refresh(): void {
    this._refreshSubject.next()
  }
}
```

- One Subject, one method, one observable. No state.
- Provided per `seam-datatable` instance via the datatable's `providers` array, so each datatable has its own.
- Naming aligned with the output: `refresh()` to invoke, `refreshRequested$` to observe. The verb form ("requested") matches the semantics — the service signals that *someone asked for* a refresh; deciding what to do is the consumer's concern.

### `DatatableComponent` changes

Two additions to `projects/ui-common/datatable/datatable/datatable.component.ts`:

1. Add `DatatableRefreshService` to the existing `providers: [...]` array (next to `DatatableColumnChangesService`).
2. Add a single output bound to the service's observable:

   ```typescript
   readonly refreshRequested = outputFromObservable(
     inject(DatatableRefreshService).refreshRequested$,
   )
   ```

   Using `outputFromObservable` from `@angular/core/rxjs-interop` avoids the manual subscription / cleanup boilerplate that an `EventEmitter` would require.

No other changes to `DatatableComponent`. The output replaces the role of the `__refreshPatch` property as the public surface for "refresh was requested."

### `DatatableRefreshButtonComponent`

New standalone component in `projects/ui-common/datatable/datatable-refresh-button/`.

```typescript
@Component({
  selector: 'seam-datatable-refresh-button',
  template: `
    <button seamButton theme="lightgray" size="sm" (click)="_onClick()">
      <seam-icon [icon]="_refreshIcon"></seam-icon>
    </button>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TheSeamButtonsModule, TheSeamIconModule],
})
export class DatatableRefreshButtonComponent {
  private readonly _refreshService = inject(DatatableRefreshService)
  readonly _refreshIcon = faSyncAlt

  _onClick(): void {
    this._refreshService.refresh()
  }
}
```

- Selector `seam-datatable-refresh-button` mirrors `seam-datatable-export-button`.
- Standalone by default (preferred for new code per AGENTS.md).
- Injects `DatatableRefreshService` from the ancestor `seam-datatable` injection scope. If a consumer drops the button outside a datatable, Angular's DI raises an error — that's the right failure mode given this component only makes sense inside a datatable.
- No directive, no `@ViewChild`, no patched property.

## Consumer Flows

### REST flow

Old (per-app):

```typescript
@ViewChild(DatatableComponent, { static: true })
_datatableComponent!: DatatableComponent

ngAfterViewInit(): void {
  dtRefreshTrigger(this._datatableComponent)
    .pipe(untilDestroyed(this))
    .subscribe(() => this._refresh())
}
```

New:

```html
<seam-datatable ... (refreshRequested)="_refresh()">
```

The `@ViewChild` and the `dtRefreshTrigger` helper both go away from REST consumers. Components that already wrap their refresh logic in a method (e.g. `marketing-claims-list.component.ts`) just bind that method to the output.

### GraphQL flow

In `projects/ui-common/graphql/datatable/datatable-helpers.ts`, replace lines 120–135:

```typescript
// Before
refreshBtnSub = datatable$
  .pipe(
    switchMap((dt) => {
      if (!dt || !(dt as any).__refreshPatch) {
        return EMPTY
      }
      return (dt as any).__refreshPatch.refreshTriggered.pipe(
        tap(() => queryRef.refetch(undefined, true)),
      )
    }),
  )
  .subscribe()
```

```typescript
// After
refreshBtnSub = datatable$
  .pipe(
    switchMap((dt) => (dt ? dt.refreshRequested : EMPTY)),
    tap(() => queryRef.refetch(undefined, true)),
  )
  .subscribe()
```

`dt.refreshRequested` is the `OutputRef` produced by `outputFromObservable`, which is subscribable via its `subscribe` method. (If RxJS interop with `OutputRef` is awkward in a pure-RxJS pipeline, the helper can pull from a getter on the datatable instead — see "Open Questions" below.)

The signature of `observeRowsWithGqlInputsHandling` does not change.

## File Layout

```text
projects/ui-common/datatable/
  services/
    datatable-refresh.service.ts          # NEW
  datatable-refresh-button/
    datatable-refresh-button.component.ts # NEW
    datatable-refresh-button.component.spec.ts
    datatable-refresh-button.stories.ts
  datatable/
    datatable.component.ts                # MODIFIED: add provider + output
  public-api.ts                           # MODIFIED: export new component + service
```

## Public API Additions

Added to `projects/ui-common/datatable/public-api.ts`:

```typescript
export * from './datatable-refresh-button/datatable-refresh-button.component'
export * from './services/datatable-refresh.service'
```

`DatatableComponent`'s new `refreshRequested` output is exposed automatically through its existing export.

## Naming

| Thing                 | Name                                         | Rationale                                                                       |
| --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| Service               | `DatatableRefreshService`                    | Mirrors `DatatableColumnChangesService` naming.                                 |
| Service method        | `refresh()`                                  | Verb; what the caller is doing.                                                 |
| Service observable    | `refreshRequested$`                          | Past-participle; what observers learn — that a refresh was *requested*.         |
| Component             | `DatatableRefreshButtonComponent`            | Mirrors `DatatableExportButtonComponent`.                                       |
| Component selector    | `seam-datatable-refresh-button`              | Matches `seam-datatable-export-button`.                                         |
| Datatable output      | `(refreshRequested)`                         | Same semantics as the observable; reads naturally in templates.                 |

## What Is Removed / Not Carried Over

- `DatatableRefreshBtnDirective` — the patched `__refreshPatch` property is replaced by an injected service.
- `dtRefreshTrigger(dt)` helper — replaced by the template-bound output for REST and the output observable for the GraphQL helper.
- The `(dt as any).__refreshPatch` cast in `datatable-helpers.ts`.

## Testing

- **Service**: Jest spec verifying `refresh()` causes `refreshRequested$` to emit.
- **Button**: Storybook story with a `play` function that clicks the button and asserts the injected service emits. Use the existing button harness pattern in `projects/ui-common/buttons/testing/` if one fits; otherwise an inline test-host suffices.
- **`DatatableComponent`**: existing tests must keep passing. Add a small spec verifying that calling `refresh()` on the provided service causes `refreshRequested` to emit.
- **GraphQL helper**: existing tests in `projects/ui-common/graphql/` must keep passing after the swap from `__refreshPatch` to `dt.refreshRequested`.

## Open Questions / Implementation Notes

1. **`OutputRef` in pure-RxJS subscription** — If `dt.refreshRequested.subscribe(...)` doesn't compose cleanly inside the existing `switchMap` chain in `datatable-helpers.ts`, the cleanest fallback is to add a `readonly refreshRequested$ = inject(DatatableRefreshService).refreshRequested$` getter on `DatatableComponent` alongside the output, and have the helper subscribe to that. The output stays for templates; the observable stays for RxJS callers. Decide during implementation; both are one line.
2. **Style parity** — The original button used `:host { display: block }`. Carry that over verbatim unless Storybook reveals a layout regression in the menu bar.
3. **Icon import** — Same `faSyncAlt` from `@fortawesome/free-solid-svg-icons`.
