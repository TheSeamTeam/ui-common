# Datatable Refresh Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-app `datatable-refresh-btn.module.ts` with a proper `@theseam/ui-common/datatable` feature: a `DatatableRefreshService`, a `DatatableRefreshButtonComponent`, a `(refreshRequested)` output on `DatatableComponent`, and a clean GraphQL-helper subscription that drops the `__refreshPatch` monkey-patch.

**Architecture:** A small `@Injectable()` service is provided by `DatatableComponent` (mirroring `DatatableColumnChangesService`). The button injects the service from the ancestor datatable's injection scope and calls `refresh()`. `DatatableComponent` exposes a `refreshRequested` output bound to the service's observable via `outputFromObservable`. REST consumers wire `(refreshRequested)="..."` in their template. The GraphQL helper subscribes via `outputToObservable(dt.refreshRequested)`.

**Tech Stack:** Angular 20 (standalone components, `inject()`, `outputFromObservable`/`outputToObservable` from `@angular/core/rxjs-interop`), RxJS, ng-packagr, Jest, Storybook 9, FontAwesome (`faSyncAlt`).

**Reference spec:** `docs/superpowers/specs/2026-04-21-datatable-refresh-button-design.md`

---

## File Structure

| File | Status | Responsibility |
| ---- | ------ | -------------- |
| `projects/ui-common/datatable/services/datatable-refresh.service.ts` | Create | One Subject + `refresh()` + `refreshRequested$`. |
| `projects/ui-common/datatable/services/datatable-refresh.service.spec.ts` | Create | Unit test for the service. |
| `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.ts` | Create | Standalone button component; injects service, renders sync icon. |
| `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts` | Create | Unit test verifying click → service emits. |
| `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.stories.ts` | Create | Storybook story with `play` function for end-to-end click test. |
| `projects/ui-common/datatable/testing/datatable-refresh-button-harness.ts` | Create | CDK harness for the new button. |
| `projects/ui-common/datatable/testing/index.ts` | Modify | Export new harness. |
| `projects/ui-common/datatable/datatable/datatable.component.ts` | Modify | Add `DatatableRefreshService` to providers; add `refreshRequested` output. |
| `projects/ui-common/datatable/datatable.module.ts` | Modify | `imports`/`exports` the new standalone button. |
| `projects/ui-common/datatable/public-api.ts` | Modify | Export new service + new component. |
| `projects/ui-common/graphql/models/gql-datatable-accessor.ts` | Modify | Add `'refreshRequested'` to the `Pick<DatatableComponent, …>`. |
| `projects/ui-common/graphql/testing/mock-datatable.ts` | Modify | Add a mock `refreshRequested` `OutputRef<void>` + a `triggerRefresh()` helper. |
| `projects/ui-common/graphql/datatable/datatable-helpers.ts` | Modify | Replace `(dt as any).__refreshPatch.refreshTriggered` with `outputToObservable(dt.refreshRequested)`. |

No files are deleted — the local `datatable-refresh-btn.module.ts` lives in the consumer apps and the user will migrate those separately.

---

## Task 1: Create `DatatableRefreshService`

**Files:**
- Create: `projects/ui-common/datatable/services/datatable-refresh.service.ts`
- Test: `projects/ui-common/datatable/services/datatable-refresh.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/datatable/services/datatable-refresh.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing'

import { DatatableRefreshService } from './datatable-refresh.service'

describe('DatatableRefreshService', () => {
  let service: DatatableRefreshService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatatableRefreshService],
    })
    service = TestBed.inject(DatatableRefreshService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('emits on refreshRequested$ each time refresh() is called', () => {
    const events: number[] = []
    let counter = 0
    const sub = service.refreshRequested$.subscribe(() => {
      events.push(++counter)
    })

    service.refresh()
    service.refresh()
    service.refresh()

    expect(events).toEqual([1, 2, 3])
    sub.unsubscribe()
  })

  it('does not emit historical values to late subscribers', () => {
    service.refresh()

    const received: void[] = []
    const sub = service.refreshRequested$.subscribe((v) => received.push(v))

    expect(received).toEqual([])

    service.refresh()
    expect(received.length).toBe(1)

    sub.unsubscribe()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/services/datatable-refresh.service.spec.ts`

Expected: FAIL — `Cannot find module './datatable-refresh.service'`.

- [ ] **Step 3: Write minimal implementation**

Create `projects/ui-common/datatable/services/datatable-refresh.service.ts`:

```typescript
import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/services/datatable-refresh.service.spec.ts`

Expected: PASS — three tests passing.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/datatable/services/datatable-refresh.service.ts projects/ui-common/datatable/services/datatable-refresh.service.spec.ts
git commit -m "feat(datatable): add DatatableRefreshService"
```

---

## Task 2: Wire service + `refreshRequested` output into `DatatableComponent`

**Files:**
- Modify: `projects/ui-common/datatable/datatable/datatable.component.ts`

**What we're doing:**
1. Import `DatatableRefreshService` and `outputFromObservable`.
2. Add `DatatableRefreshService` to the existing `providers: [...]` array.
3. Add a `readonly refreshRequested = outputFromObservable(inject(DatatableRefreshService).refreshRequested$)` field on the class.

There is no failing test before this change because the next test we'd write requires `refreshRequested` to exist. We'll instead verify with a "smoke" integration spec that lives in the button's spec file (Task 3). The change here is mechanical and exercised end-to-end by Task 3 and the Storybook play function in Task 5.

- [ ] **Step 1: Add the import for `DatatableRefreshService`**

In `projects/ui-common/datatable/datatable/datatable.component.ts`, find the existing import (around line 102):

```typescript
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'
```

Add immediately below it:

```typescript
import { DatatableRefreshService } from '../services/datatable-refresh.service'
```

- [ ] **Step 2: Add the import for `outputFromObservable`**

In the same file, find the existing `@angular/core` import block (starts around line 9). Add the rxjs-interop import immediately after the `@angular/core` block:

```typescript
import { outputFromObservable } from '@angular/core/rxjs-interop'
```

- [ ] **Step 3: Add `DatatableRefreshService` to the providers array**

Find the `providers: [...]` array in the `@Component` decorator (around lines 193–200):

```typescript
  providers: [
    _THESEAM_DATATABLE,
    DatatableColumnChangesService,
    _THESEAM_DATATABLE_ACCESSOR,
    ColumnsManagerService,
    ColumnsAlterationsManagerService,
    ColumnsFiltersService,
  ],
```

Replace with:

```typescript
  providers: [
    _THESEAM_DATATABLE,
    DatatableColumnChangesService,
    DatatableRefreshService,
    _THESEAM_DATATABLE_ACCESSOR,
    ColumnsManagerService,
    ColumnsAlterationsManagerService,
    ColumnsFiltersService,
  ],
```

- [ ] **Step 4: Add the `refreshRequested` output field**

Find the existing `_cdr` injection field on the class (around line 237):

```typescript
  _cdr = inject(ChangeDetectorRef)
```

Add immediately below it:

```typescript
  readonly refreshRequested = outputFromObservable(
    inject(DatatableRefreshService).refreshRequested$,
  )
```

- [ ] **Step 5: Verify the file still type-checks**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json`

Expected: no new errors related to `datatable.component.ts`. (Pre-existing errors in unrelated files, if any, are out of scope.)

- [ ] **Step 6: Run the existing datatable specs**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/datatable/datatable.component.spec.ts`

Expected: PASS — existing tests continue to pass; we have added behavior, not changed it.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/datatable/datatable/datatable.component.ts
git commit -m "feat(datatable): expose refreshRequested output and provide DatatableRefreshService"
```

---

## Task 3: Create `DatatableRefreshButtonComponent`

**Files:**
- Create: `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.ts`
- Test: `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts`:

```typescript
import { Component, ViewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { DatatableRefreshService } from '../services/datatable-refresh.service'
import { DatatableRefreshButtonComponent } from './datatable-refresh-button.component'

@Component({
  template: `<seam-datatable-refresh-button></seam-datatable-refresh-button>`,
  imports: [DatatableRefreshButtonComponent],
  providers: [DatatableRefreshService],
})
class TestHostComponent {
  @ViewChild(DatatableRefreshButtonComponent)
  button!: DatatableRefreshButtonComponent
}

describe('DatatableRefreshButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    })
  })

  it('renders a button', () => {
    const fixture = TestBed.createComponent(TestHostComponent)
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    expect(btn).toBeTruthy()
  })

  it('calls refresh() on the injected service when clicked', () => {
    const fixture = TestBed.createComponent(TestHostComponent)
    const service = fixture.debugElement
      .query(By.directive(DatatableRefreshButtonComponent))
      .injector.get(DatatableRefreshService)

    const refreshSpy = jest.spyOn(service, 'refresh')
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    btn.nativeElement.click()

    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })

  it('is wired to a parent service so emissions are observable on refreshRequested$', (done) => {
    const fixture = TestBed.createComponent(TestHostComponent)
    const service = fixture.debugElement
      .query(By.directive(DatatableRefreshButtonComponent))
      .injector.get(DatatableRefreshService)

    fixture.detectChanges()

    service.refreshRequested$.subscribe(() => {
      done()
    })

    const btn = fixture.debugElement.query(By.css('button'))
    btn.nativeElement.click()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts`

Expected: FAIL — `Cannot find module './datatable-refresh-button.component'`.

- [ ] **Step 3: Write minimal implementation**

Create `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { DatatableRefreshService } from '../services/datatable-refresh.service'

@Component({
  selector: 'seam-datatable-refresh-button',
  template: `
    <button seamButton theme="lightgray" size="sm" (click)="_onClick()">
      <seam-icon [icon]="_refreshIcon"></seam-icon>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts`

Expected: PASS — three tests passing.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.ts projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.component.spec.ts
git commit -m "feat(datatable): add DatatableRefreshButtonComponent"
```

---

## Task 4: Register the button in the NgModule and the public API

**Files:**
- Modify: `projects/ui-common/datatable/datatable.module.ts`
- Modify: `projects/ui-common/datatable/public-api.ts`

The button is standalone, so it goes in `imports` and `exports` of the existing NgModule (not `declarations`).

- [ ] **Step 1: Add the import in `datatable.module.ts`**

In `projects/ui-common/datatable/datatable.module.ts`, find the existing import for `DatatableExportButtonComponent`:

```typescript
import { DatatableExportButtonComponent } from './datatable-export-button/datatable-export-button.component'
```

Add immediately below it:

```typescript
import { DatatableRefreshButtonComponent } from './datatable-refresh-button/datatable-refresh-button.component'
```

- [ ] **Step 2: Add the component to the NgModule's `imports` and `exports`**

In the same file, find the bottom of the `imports: [...]` array (around line 111, after `DatatableColumnFilterSearchDateComponent`). Add the new standalone component as the last entry of `imports`:

```typescript
    DatatableColumnFilterSearchDateComponent,
    DatatableRefreshButtonComponent,
  ],
```

Then find the `exports: [...]` array (around line 113). Add `DatatableRefreshButtonComponent` near `DatatableExportButtonComponent` for parity. Replace:

```typescript
    DatatableExportButtonComponent,
```

with:

```typescript
    DatatableExportButtonComponent,
    DatatableRefreshButtonComponent,
```

- [ ] **Step 3: Add the public-API exports**

In `projects/ui-common/datatable/public-api.ts`, find the line:

```typescript
export * from './datatable-export-button/datatable-export-button.component'
```

Add immediately below it:

```typescript
export * from './datatable-refresh-button/datatable-refresh-button.component'
```

Then find the services block (lines starting with `export * from './services/...'`) and add:

```typescript
export * from './services/datatable-refresh.service'
```

- [ ] **Step 4: Verify the library builds**

Run: `npm run build:ui-common`

Expected: build completes without errors. (If `build:ui-common` is slow/heavy and you want a faster check first, run `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json`. For final confidence, run the full build.)

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/datatable/datatable.module.ts projects/ui-common/datatable/public-api.ts
git commit -m "feat(datatable): export refresh button and service from datatable entry point"
```

---

## Task 5: Add a CDK harness and a Storybook story

**Files:**
- Create: `projects/ui-common/datatable/testing/datatable-refresh-button-harness.ts`
- Modify: `projects/ui-common/datatable/testing/index.ts`
- Create: `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.stories.ts`

- [ ] **Step 1: Write the harness**

Create `projects/ui-common/datatable/testing/datatable-refresh-button-harness.ts`:

```typescript
import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing'

export type TheSeamDatatableRefreshButtonHarnessFilters = BaseHarnessFilters

export class TheSeamDatatableRefreshButtonHarness extends ComponentHarness {
  static hostSelector = 'seam-datatable-refresh-button'

  static with<T extends TheSeamDatatableRefreshButtonHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TheSeamDatatableRefreshButtonHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
  }

  private readonly _button = this.locatorFor('button')

  /** Clicks the refresh button. */
  public async click(): Promise<void> {
    return (await this._button()).click()
  }

  /** Whether the underlying button is disabled. */
  public async isDisabled(): Promise<boolean> {
    const btn = await this._button()
    const disabled = await btn.getAttribute('disabled')
    return disabled !== null
  }
}
```

- [ ] **Step 2: Export the harness**

In `projects/ui-common/datatable/testing/index.ts`, add a new export. After the line:

```typescript
export * from './datatable-pager-harness'
```

add:

```typescript
export * from './datatable-refresh-button-harness'
```

- [ ] **Step 3: Write the Storybook story**

Create `projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.stories.ts`:

```typescript
import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamDatatableModule } from '../datatable.module'
import { DatatableRefreshButtonComponent } from './datatable-refresh-button.component'
import { TheSeamDatatableRefreshButtonHarness } from '../testing'

interface StoryArgs {
  columns: Array<{ prop: string; name: string }>
  rows: Array<Record<string, unknown>>
  refreshRequested: () => void
}

const meta: Meta<DatatableRefreshButtonComponent & StoryArgs> = {
  title: 'Datatable/Components',
  component: DatatableRefreshButtonComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamDatatableModule],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
}

export default meta
type Story = StoryObj<DatatableRefreshButtonComponent & StoryArgs>

export const Refresh: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="vh-100 d-flex flex-column p-2">
        <seam-datatable
          [columns]="columns"
          [rows]="rows"
          (refreshRequested)="refreshRequested()">

          <seam-datatable-menu-bar>
            <div class="d-flex flex-row justify-content-end">
              <seam-datatable-refresh-button></seam-datatable-refresh-button>
            </div>
          </seam-datatable-menu-bar>

        </seam-datatable>
      </div>`,
  }),
  args: {
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' },
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ],
    refreshRequested: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await expect(args.refreshRequested).toHaveBeenCalledTimes(0)
    const harness = await getHarness(TheSeamDatatableRefreshButtonHarness, {
      canvasElement,
    })
    await harness.click()
    await expect(args.refreshRequested).toHaveBeenCalledTimes(1)
  },
}
```

Note: `getHarness` is re-exported from `@theseam/ui-common/testing` (which maps to `projects/ui-common/testing/`). The new datatable-specific harness lives in `projects/ui-common/datatable/testing/`, a separate module, so it is imported via the relative path `'../testing'`. Mirrors the sibling `datatable-column-preferences-button.stories.ts`.

- [ ] **Step 4: Run jest to make sure the harness file compiles cleanly within the test runner**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable/testing`

Expected: any specs that import from `testing/index.ts` continue to pass; the new harness file is picked up at compile time.

- [ ] **Step 5: (Optional) verify the story in Storybook**

If Storybook is already running locally, navigate to **Datatable / Components / DatatableRefreshButtonComponent → Refresh** and click the button. (Don't start a new Storybook instance — per AGENTS.md, ask the user first if Storybook isn't already running.)

If Storybook is running, you can also run: `npx test-storybook` and confirm the new story passes.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/datatable/testing/datatable-refresh-button-harness.ts projects/ui-common/datatable/testing/index.ts projects/ui-common/datatable/datatable-refresh-button/datatable-refresh-button.stories.ts
git commit -m "test(datatable): add refresh button harness and storybook story"
```

---

## Task 6: Extend `GqlDatatableAccessor` and `MockDatatable` with `refreshRequested`

**Files:**
- Modify: `projects/ui-common/graphql/models/gql-datatable-accessor.ts`
- Modify: `projects/ui-common/graphql/testing/mock-datatable.ts`

The GraphQL helper takes a `GqlDatatableAccessor` (a `Pick` of `DatatableComponent`). To use the new output, that pick must include `'refreshRequested'`. The mock implementation must satisfy the new shape.

- [ ] **Step 1: Add `refreshRequested` to the `Pick`**

In `projects/ui-common/graphql/models/gql-datatable-accessor.ts`, replace the current file contents:

```typescript
import { DatatableComponent } from '@theseam/ui-common/datatable'

export type GqlDatatableAccessor = Pick<
  DatatableComponent,
  | 'page'
  | 'sort'
  | 'sorts'
  | 'filterStates'
  | 'pageInfo'
  | 'externalSorting'
  | 'columns$'
> &
  // TODO: Remove when Datatable wrapper is fixed and exposes these.
  {
    ngxDatatable: {
      offset: number
      pageSize: number
      limit?: number
      count: number
    }
  }
```

with:

```typescript
import { DatatableComponent } from '@theseam/ui-common/datatable'

export type GqlDatatableAccessor = Pick<
  DatatableComponent,
  | 'page'
  | 'sort'
  | 'sorts'
  | 'filterStates'
  | 'pageInfo'
  | 'externalSorting'
  | 'columns$'
  | 'refreshRequested'
> &
  // TODO: Remove when Datatable wrapper is fixed and exposes these.
  {
    ngxDatatable: {
      offset: number
      pageSize: number
      limit?: number
      count: number
    }
  }
```

- [ ] **Step 2: Update the mock to satisfy the new shape**

In `projects/ui-common/graphql/testing/mock-datatable.ts`, add an import at the top of the file, alongside the existing `EventEmitter` import:

```typescript
import { OutputRef } from '@angular/core'
```

Then inside the `MockDatatable` class — after the existing `private readonly _filterStatesSubject = new BehaviorSubject<DataFilterState[]>([])` field — add:

```typescript
  private readonly _refreshSubject = new Subject<void>()

  public readonly refreshRequested: OutputRef<void> = {
    subscribe: (cb: (value: void) => void) => {
      const sub = this._refreshSubject.subscribe(() => cb(undefined as void))
      return { unsubscribe: () => sub.unsubscribe() }
    },
  }

  /** Test helper: simulate the refresh button being clicked. */
  public triggerRefresh(): void {
    this._refreshSubject.next()
  }
```

You will also need to import `Subject` if it isn't already imported in this file (the file already uses `BehaviorSubject` from `rxjs`, so update that import to also bring in `Subject`):

```typescript
import { BehaviorSubject, Observable, Subject } from 'rxjs'
```

- [ ] **Step 3: Type-check the graphql project**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json`

Expected: no errors. (`MockDatatable implements GqlDatatableAccessor` must still satisfy the interface after the new member is added.)

- [ ] **Step 4: Run the existing graphql tests to confirm nothing regresses**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/graphql`

Expected: PASS — all existing tests continue to pass.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/graphql/models/gql-datatable-accessor.ts projects/ui-common/graphql/testing/mock-datatable.ts
git commit -m "feat(graphql): expose refreshRequested through GqlDatatableAccessor and MockDatatable"
```

---

## Task 7: Replace `__refreshPatch` in the GraphQL helper

**Files:**
- Modify: `projects/ui-common/graphql/datatable/datatable-helpers.ts` (lines 120–135)

This is the payoff: the helper drops the `(dt as any).__refreshPatch` cast and subscribes through honest Angular API.

- [ ] **Step 1: Add the rxjs-interop import**

In `projects/ui-common/graphql/datatable/datatable-helpers.ts`, find the existing imports near the top of the file. Add this import (placement: after the `rxjs/operators` import block):

```typescript
import { outputToObservable } from '@angular/core/rxjs-interop'
```

- [ ] **Step 2: Replace the `__refreshPatch` block**

Find the block at lines 120–135 (inside the `defer(() => { ... })` callback):

```typescript
  return defer(() => {
    // Observe the optional refresh-button patch attached externally to the
    // datatable instance. When the user triggers a refresh, refetch the data.
    let refreshBtnSub: Subscription = Subscription.EMPTY
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

Replace with:

```typescript
  return defer(() => {
    // Observe the datatable's refreshRequested output. When the user clicks the
    // refresh button (or any other consumer triggers DatatableRefreshService),
    // refetch the data.
    let refreshBtnSub: Subscription = Subscription.EMPTY
    refreshBtnSub = datatable$
      .pipe(
        switchMap((dt) =>
          dt ? outputToObservable(dt.refreshRequested) : EMPTY,
        ),
        tap(() => queryRef.refetch(undefined, true)),
      )
      .subscribe()
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p projects/ui-common/tsconfig.lib.json`

Expected: no errors.

- [ ] **Step 4: Run the graphql tests**

Run: `npx jest --config projects/ui-common/jest.config.ts projects/ui-common/graphql`

Expected: PASS — existing tests continue to pass. (The helper has no dedicated `*.spec.ts`; integration is covered by the surrounding graphql specs that exercise `observeRowsWithGqlInputsHandling` indirectly.)

- [ ] **Step 5: Build the library to confirm everything still ships**

Run: `npm run build:ui-common`

Expected: build completes successfully.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/graphql/datatable/datatable-helpers.ts
git commit -m "refactor(graphql): subscribe to dt.refreshRequested instead of __refreshPatch"
```

---

## Final Verification

After all tasks above:

- [ ] **Run the full datatable + graphql test slice:**

  ```bash
  npx jest --config projects/ui-common/jest.config.ts projects/ui-common/datatable projects/ui-common/graphql
  ```

  Expected: all green.

- [ ] **Run lint on changed files:**

  ```bash
  npm run lint
  ```

  Expected: no errors. Warnings on pre-existing files unrelated to this work are acceptable.

- [ ] **Build the library:**

  ```bash
  npm run build:ui-common
  ```

  Expected: build completes.

- [ ] **Sanity-check exports:** confirm `import { DatatableRefreshButtonComponent, DatatableRefreshService } from '@theseam/ui-common/datatable'` resolves in the build output (visually inspect `dist/ui-common/datatable/index.d.ts`).

No app migration is in scope — the user will handle that in a separate session.
