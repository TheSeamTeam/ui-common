# Route Transition Animations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-module Base components and `routeTransitionId` boilerplate with a reusable `seamRouteTransition()` factory and `SeamRouteShellComponent`, powered by the View Transition API via Angular's `withViewTransitions()`.

**Architecture:** A factory function detects navigation direction (sibling/deeper/shallower) by comparing shared path prefixes of the previous and next routes, sets a `data-route-direction` attribute on `<html>`, and CSS `::view-transition-*` pseudo-elements animate accordingly. A standalone shell component replaces all per-module Base components.

**Tech Stack:** Angular 20.3, View Transition API, CSS animations, `withViewTransitions()` (`@developerPreview 20.0`)

**Spec:** `docs/superpowers/specs/2026-03-15-route-transition-animations-design.md`

---

## File Structure

```
projects/ui-common/
  framework/
    route-transitions/
      index.ts                            # Barrel — exports all public API
      compute-direction.ts                # Pure function: (prev, next) => direction
      get-url-segments.ts                 # Pure function: ActivatedRouteSnapshot => string[]
      seam-route-transition.ts            # Factory for withViewTransitions() callback
      seam-route-shell.component.ts       # Standalone shell component
      compute-direction.spec.ts           # Unit tests for direction logic
      get-url-segments.spec.ts            # Unit tests for segment extraction
      seam-route-transition.spec.ts       # Integration test for the factory
  styles/
    route-transitions.css                 # Animation keyframes and direction rules
```

**Modified files:**
- `projects/ui-common/framework/public-api.ts` — add `route-transitions` export
- `projects/ui-common/jest.config.ts` — add `route-transitions` to testMatch

---

## Chunk 1: Core Direction Logic

### Task 1: Create `computeDirection` with tests (TDD)

**Files:**
- Create: `projects/ui-common/framework/route-transitions/compute-direction.ts`
- Create: `projects/ui-common/framework/route-transitions/compute-direction.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/framework/route-transitions/compute-direction.spec.ts`:

```typescript
import { computeDirection } from './compute-direction'

describe('computeDirection', () => {
  it('returns "sibling" for same-depth siblings with shared parent', () => {
    // /claims -> /purchase-orders (shared: [], both have remainders)
    expect(computeDirection(['claims'], ['purchase-orders'])).toBe('sibling')
  })

  it('returns "sibling" for cross-branch with different depths', () => {
    // /claims/123/edit -> /purchase-orders/456 (shared: [], both have remainders)
    expect(computeDirection(['claims', '123', 'edit'], ['purchase-orders', '456'])).toBe('sibling')
  })

  it('returns "sibling" for cross-branch with asymmetric depth', () => {
    // /claims/123/edit -> /purchase-orders (shared: [], both have remainders — switched sections)
    expect(computeDirection(['claims', '123', 'edit'], ['purchase-orders'])).toBe('sibling')
  })

  it('returns "sibling" for cross-branch going to deeper path', () => {
    // /purchase-orders -> /claims/123/edit (shared: [], both have remainders — switched sections)
    expect(computeDirection(['purchase-orders'], ['claims', '123', 'edit'])).toBe('sibling')
  })

  it('returns "sibling" when navigating between siblings with shared parent', () => {
    // /claims/123 -> /claims/456 (shared: [claims], both have remainders)
    expect(computeDirection(['claims', '123'], ['claims', '456'])).toBe('sibling')
  })

  it('returns "deeper" when entering a child (prev remainder is empty)', () => {
    // /claims -> /claims/123 (shared: [claims], prev remainder: [], next remainder: [123])
    expect(computeDirection(['claims'], ['claims', '123'])).toBe('deeper')
  })

  it('returns "deeper" for multi-level depth increase', () => {
    // /claims -> /claims/123/edit (shared: [claims], prev remainder: [], next remainder: [123, edit])
    expect(computeDirection(['claims'], ['claims', '123', 'edit'])).toBe('deeper')
  })

  it('returns "shallower" when returning to parent (next remainder is empty)', () => {
    // /claims/123 -> /claims (shared: [claims], prev remainder: [123], next remainder: [])
    expect(computeDirection(['claims', '123'], ['claims'])).toBe('shallower')
  })

  it('returns "deeper" when previous is empty (initial navigation)', () => {
    expect(computeDirection([], ['claims'])).toBe('deeper')
  })

  it('returns "sibling" when both are empty', () => {
    expect(computeDirection([], [])).toBe('sibling')
  })
})
```

- [ ] **Step 2: Add route-transitions to jest testMatch**

Modify `projects/ui-common/jest.config.ts` — add to the `testMatch` array:

```typescript
'**/route-transitions/**/*.spec.ts',
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern route-transitions`
Expected: FAIL — `Cannot find module './compute-direction'`

- [ ] **Step 4: Write minimal implementation**

Create `projects/ui-common/framework/route-transitions/compute-direction.ts`:

```typescript
export type RouteDirection = 'sibling' | 'deeper' | 'shallower'

export function computeDirection(prev: string[], next: string[]): RouteDirection {
  let shared = 0
  while (shared < prev.length && shared < next.length && prev[shared] === next[shared]) {
    shared++
  }

  const prevRemaining = prev.length - shared
  const nextRemaining = next.length - shared

  if (prevRemaining === 0 && nextRemaining > 0) return 'deeper'
  if (prevRemaining > 0 && nextRemaining === 0) return 'shallower'
  return 'sibling'
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern route-transitions`
Expected: All 10 tests PASS

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/framework/route-transitions/compute-direction.ts projects/ui-common/framework/route-transitions/compute-direction.spec.ts projects/ui-common/jest.config.ts
git commit -m "feat(route-transitions): add computeDirection with tests"
```

---

### Task 2: Create `getUrlSegments` with tests (TDD)

**Files:**
- Create: `projects/ui-common/framework/route-transitions/get-url-segments.ts`
- Create: `projects/ui-common/framework/route-transitions/get-url-segments.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `projects/ui-common/framework/route-transitions/get-url-segments.spec.ts`:

```typescript
import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router'
import { getUrlSegments } from './get-url-segments'

function makeSnapshot(segments: string[][], parent?: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  // Build a chain of snapshots from root to leaf.
  // Each entry in `segments` is the url segments for one level.
  let root: ActivatedRouteSnapshot | undefined
  let current: ActivatedRouteSnapshot | undefined

  for (const segs of segments) {
    const snapshot = {
      url: segs.map(s => new UrlSegment(s, {})),
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot

    if (!root) {
      root = snapshot
    }
    if (current) {
      (current as any).firstChild = snapshot
    }
    current = snapshot
  }

  return root!
}

describe('getUrlSegments', () => {
  it('extracts segments from a single-level route', () => {
    const snapshot = makeSnapshot([['claims']])
    expect(getUrlSegments(snapshot)).toEqual(['claims'])
  })

  it('extracts segments from a nested route', () => {
    // Route tree: '' -> 'claims' -> '123'
    const snapshot = makeSnapshot([[''], ['claims'], ['123']])
    expect(getUrlSegments(snapshot)).toEqual(['claims', '123'])
  })

  it('extracts segments from a deeply nested route', () => {
    const snapshot = makeSnapshot([[''], ['claims'], ['123'], ['edit']])
    expect(getUrlSegments(snapshot)).toEqual(['claims', '123', 'edit'])
  })

  it('handles empty root segment', () => {
    const snapshot = makeSnapshot([['']])
    expect(getUrlSegments(snapshot)).toEqual([])
  })

  it('handles multiple segments at one level', () => {
    // Unusual but possible — a route with a matrix-like multi-segment path
    const snapshot = makeSnapshot([['section', 'claims'], ['123']])
    expect(getUrlSegments(snapshot)).toEqual(['section', 'claims', '123'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern get-url-segments`
Expected: FAIL — `Cannot find module './get-url-segments'`

- [ ] **Step 3: Write minimal implementation**

Create `projects/ui-common/framework/route-transitions/get-url-segments.ts`:

```typescript
import { ActivatedRouteSnapshot } from '@angular/router'

export function getUrlSegments(snapshot: ActivatedRouteSnapshot): string[] {
  const segments: string[] = []
  let current: ActivatedRouteSnapshot | null = snapshot

  while (current) {
    for (const seg of current.url) {
      if (seg.path) {
        segments.push(seg.path)
      }
    }
    current = current.firstChild
  }

  return segments
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern get-url-segments`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/framework/route-transitions/get-url-segments.ts projects/ui-common/framework/route-transitions/get-url-segments.spec.ts
git commit -m "feat(route-transitions): add getUrlSegments with tests"
```

---

## Chunk 2: Factory, Shell Component, and CSS

### Task 3: Create `seamRouteTransition()` factory

**Files:**
- Create: `projects/ui-common/framework/route-transitions/seam-route-transition.ts`
- Create: `projects/ui-common/framework/route-transitions/seam-route-transition.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/framework/route-transitions/seam-route-transition.spec.ts`:

```typescript
import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router'
import { seamRouteTransition } from './seam-route-transition'

function makeSnapshot(pathSegments: string[][]): ActivatedRouteSnapshot {
  let root: ActivatedRouteSnapshot | undefined
  let current: ActivatedRouteSnapshot | undefined

  for (const segs of pathSegments) {
    const snapshot = {
      url: segs.map(s => new UrlSegment(s, {})),
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot

    if (!root) root = snapshot
    if (current) (current as any).firstChild = snapshot
    current = snapshot
  }

  return root!
}

describe('seamRouteTransition', () => {
  let callback: (info: any) => void

  beforeEach(() => {
    callback = seamRouteTransition()
    // Clean up after each test
    delete document.documentElement.dataset['routeDirection']
  })

  afterEach(() => {
    delete document.documentElement.dataset['routeDirection']
  })

  it('sets data-route-direction to "sibling" for same-depth navigation', () => {
    callback({
      transition: {} as any,
      from: makeSnapshot([[''], ['claims']]),
      to: makeSnapshot([[''], ['purchase-orders']]),
    })

    expect(document.documentElement.dataset['routeDirection']).toBe('sibling')
  })

  it('sets data-route-direction to "deeper" when navigating deeper', () => {
    callback({
      transition: {} as any,
      from: makeSnapshot([[''], ['claims']]),
      to: makeSnapshot([[''], ['claims'], ['123']]),
    })

    expect(document.documentElement.dataset['routeDirection']).toBe('deeper')
  })

  it('sets data-route-direction to "shallower" when navigating shallower', () => {
    callback({
      transition: {} as any,
      from: makeSnapshot([[''], ['claims'], ['123']]),
      to: makeSnapshot([[''], ['claims']]),
    })

    expect(document.documentElement.dataset['routeDirection']).toBe('shallower')
  })

  it('handles cross-branch navigation as sibling', () => {
    callback({
      transition: {} as any,
      from: makeSnapshot([[''], ['claims'], ['123'], ['edit']]),
      to: makeSnapshot([[''], ['purchase-orders'], ['456']]),
    })

    expect(document.documentElement.dataset['routeDirection']).toBe('sibling')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern seam-route-transition`
Expected: FAIL — `Cannot find module './seam-route-transition'`

- [ ] **Step 3: Write the implementation**

Create `projects/ui-common/framework/route-transitions/seam-route-transition.ts`:

```typescript
import { ViewTransitionInfo } from '@angular/router'

import { computeDirection } from './compute-direction'
import { getUrlSegments } from './get-url-segments'

export function seamRouteTransition(): (info: ViewTransitionInfo) => void {
  return (info: ViewTransitionInfo) => {
    const prevSegments = getUrlSegments(info.from)
    const nextSegments = getUrlSegments(info.to)
    const direction = computeDirection(prevSegments, nextSegments)
    document.documentElement.dataset['routeDirection'] = direction
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern seam-route-transition`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/framework/route-transitions/seam-route-transition.ts projects/ui-common/framework/route-transitions/seam-route-transition.spec.ts
git commit -m "feat(route-transitions): add seamRouteTransition factory with tests"
```

---

### Task 4: Create `SeamRouteShellComponent`

**Files:**
- Create: `projects/ui-common/framework/route-transitions/seam-route-shell.component.ts`

- [ ] **Step 1: Create the component**

Create `projects/ui-common/framework/route-transitions/seam-route-shell.component.ts`:

```typescript
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'seam-route-shell',
  template: `<router-outlet></router-outlet>`,
  host: {
    '[style.view-transition-name]': '"seam-route-content"',
    '[style.display]': '"flex"',
    '[style.flex-direction]': '"column"',
    '[style.height]': '"100%"',
  },
  imports: [RouterOutlet],
  standalone: true,
})
export class SeamRouteShellComponent {}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/framework/route-transitions/seam-route-shell.component.ts
git commit -m "feat(route-transitions): add SeamRouteShellComponent"
```

---

### Task 5: Create CSS stylesheet

**Files:**
- Create: `projects/ui-common/styles/route-transitions.css`

- [ ] **Step 1: Create the stylesheet**

Create `projects/ui-common/styles/route-transitions.css`:

```css
:root {
  --seam-route-transition-duration: 400ms;
  --seam-route-transition-easing: ease-in-out;
}

/* Keyframes */
@keyframes seam-slide-in-left {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@keyframes seam-slide-in-right {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

@keyframes seam-slide-out-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}

@keyframes seam-slide-out-right {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}

/* Sibling swap: current slides right, new slides left */
html[data-route-direction="sibling"] ::view-transition-old(root),
html[data-route-direction="sibling"] ::view-transition-old(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-out-right;
}
html[data-route-direction="sibling"] ::view-transition-new(root),
html[data-route-direction="sibling"] ::view-transition-new(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-in-left;
}

/* Deeper: both slide left */
html[data-route-direction="deeper"] ::view-transition-old(root),
html[data-route-direction="deeper"] ::view-transition-old(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-out-left;
}
html[data-route-direction="deeper"] ::view-transition-new(root),
html[data-route-direction="deeper"] ::view-transition-new(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-in-left;
}

/* Shallower: both slide right */
html[data-route-direction="shallower"] ::view-transition-old(root),
html[data-route-direction="shallower"] ::view-transition-old(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-out-right;
}
html[data-route-direction="shallower"] ::view-transition-new(root),
html[data-route-direction="shallower"] ::view-transition-new(seam-route-content) {
  animation: var(--seam-route-transition-duration) var(--seam-route-transition-easing) seam-slide-in-right;
}

/* Reduced motion: disable all route transition animations */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root),
  ::view-transition-old(seam-route-content),
  ::view-transition-new(seam-route-content) {
    animation-duration: 0s !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/styles/route-transitions.css
git commit -m "feat(route-transitions): add CSS animation stylesheet"
```

---

### Task 6: Create barrel file and wire into public API

**Files:**
- Create: `projects/ui-common/framework/route-transitions/index.ts`
- Modify: `projects/ui-common/framework/public-api.ts`

- [ ] **Step 1: Create the barrel file**

Create `projects/ui-common/framework/route-transitions/index.ts`:

```typescript
export { computeDirection, RouteDirection } from './compute-direction'
export { getUrlSegments } from './get-url-segments'
export { seamRouteTransition } from './seam-route-transition'
export { SeamRouteShellComponent } from './seam-route-shell.component'
```

- [ ] **Step 2: Add route-transitions export to framework public-api.ts**

Add the following line to `projects/ui-common/framework/public-api.ts`:

```typescript
export * from './route-transitions/index'
```

- [ ] **Step 3: Verify the library builds**

Run: `npx ng build ui-common`
Expected: Build succeeds with no errors. The `dist/ui-common/styles/route-transitions.css` file should exist (distributed via the existing `styles/**/*` asset glob in `ng-package.json`).

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/framework/route-transitions/index.ts projects/ui-common/framework/public-api.ts
git commit -m "feat(route-transitions): export public API from framework entrypoint"
```

---

## Chunk 3: Storybook Demonstration

### Task 7: Create Storybook stories for route transitions

**Files:**
- Create: `projects/ui-common/framework/route-transitions/stories/route-transitions.stories.ts`

This task creates a visual demonstration of all three transition directions. The stories use Angular's router with `withViewTransitions()` and `SeamRouteShellComponent` to show real route transitions.

- [ ] **Step 1: Create story components and story file**

Create `projects/ui-common/framework/route-transitions/stories/route-transitions.stories.ts`:

```typescript
import { Component } from '@angular/core'
import { RouterLink, RouterOutlet, provideRouter, withViewTransitions, Routes } from '@angular/router'
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'

import { seamRouteTransition } from '../seam-route-transition'
import { SeamRouteShellComponent } from '../seam-route-shell.component'

// --- Story page components ---

@Component({
  selector: 'story-home',
  template: `
    <div style="padding: 24px;">
      <h2>Home</h2>
      <p>Route: /</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims" style="color: #0066cc;">Claims (sibling)</a>
        <a routerLink="/purchase-orders" style="color: #0066cc;">Purchase Orders (sibling)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryHomeComponent {}

@Component({
  selector: 'story-claims-list',
  template: `
    <div style="padding: 24px; background: #e3f2fd; min-height: 200px;">
      <h2>Claims List</h2>
      <p>Route: /claims</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/" style="color: #0066cc;">Home (sibling)</a>
        <a routerLink="/claims/123" style="color: #0066cc;">Claim 123 (deeper)</a>
        <a routerLink="/purchase-orders" style="color: #0066cc;">Purchase Orders (sibling)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimsListComponent {}

@Component({
  selector: 'story-claim-detail',
  template: `
    <div style="padding: 24px; background: #bbdefb; min-height: 200px;">
      <h2>Claim Detail</h2>
      <p>Route: /claims/123</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims" style="color: #0066cc;">Claims List (shallower)</a>
        <a routerLink="/claims/123/edit" style="color: #0066cc;">Edit (deeper)</a>
        <a routerLink="/purchase-orders/456" style="color: #0066cc;">PO 456 (cross-branch)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimDetailComponent {}

@Component({
  selector: 'story-claim-edit',
  template: `
    <div style="padding: 24px; background: #90caf9; min-height: 200px;">
      <h2>Claim Edit</h2>
      <p>Route: /claims/123/edit</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims/123" style="color: #0066cc;">Claim Detail (shallower)</a>
        <a routerLink="/claims" style="color: #0066cc;">Claims List (shallower)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimEditComponent {}

@Component({
  selector: 'story-po-list',
  template: `
    <div style="padding: 24px; background: #e8f5e9; min-height: 200px;">
      <h2>Purchase Orders</h2>
      <p>Route: /purchase-orders</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/" style="color: #0066cc;">Home (sibling)</a>
        <a routerLink="/claims" style="color: #0066cc;">Claims (sibling)</a>
        <a routerLink="/purchase-orders/456" style="color: #0066cc;">PO 456 (deeper)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryPOListComponent {}

@Component({
  selector: 'story-po-detail',
  template: `
    <div style="padding: 24px; background: #c8e6c9; min-height: 200px;">
      <h2>Purchase Order Detail</h2>
      <p>Route: /purchase-orders/456</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/purchase-orders" style="color: #0066cc;">PO List (shallower)</a>
        <a routerLink="/claims/123" style="color: #0066cc;">Claim 123 (cross-branch)</a>
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryPODetailComponent {}

// --- Story wrapper ---

@Component({
  selector: 'story-wrapper',
  template: `
    <div style="border: 1px solid #ccc; border-radius: 4px; overflow: hidden; height: 400px;">
      <div style="padding: 8px 16px; background: #f5f5f5; border-bottom: 1px solid #ccc; font-size: 12px; color: #666;">
        Route Transition Demo — click links to see directional transitions
      </div>
      <div style="position: relative; overflow: hidden; height: calc(100% - 37px);">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  imports: [RouterOutlet],
  standalone: true,
})
class StoryWrapperComponent {}

// --- Routes ---

const storyRoutes: Routes = [
  {
    path: '',
    component: StoryWrapperComponent,
    children: [
      { path: '', component: StoryHomeComponent, pathMatch: 'full' },
      {
        path: 'claims',
        component: SeamRouteShellComponent,
        children: [
          { path: '', component: StoryClaimsListComponent, pathMatch: 'full' },
          {
            path: ':id',
            component: SeamRouteShellComponent,
            children: [
              { path: '', component: StoryClaimDetailComponent, pathMatch: 'full' },
              { path: 'edit', component: StoryClaimEditComponent },
            ],
          },
        ],
      },
      {
        path: 'purchase-orders',
        component: SeamRouteShellComponent,
        children: [
          { path: '', component: StoryPOListComponent, pathMatch: 'full' },
          { path: ':id', component: StoryPODetailComponent },
        ],
      },
    ],
  },
]

// --- Story definition ---

const meta: Meta<StoryWrapperComponent> = {
  title: 'Framework/Route Transitions',
  component: StoryWrapperComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideRouter(storyRoutes, withViewTransitions({ onViewTransitionCreated: seamRouteTransition() })),
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<StoryWrapperComponent>

export const Demo: Story = {}
```

- [ ] **Step 2: Add the route-transitions CSS to storybook styles**

Add `projects/ui-common/styles/route-transitions.css` to the `styles` array in `angular.json` at both of these JSON paths:
- `projects.ui-common.architect.storybook.options.styles`
- `projects.ui-common.architect.build-storybook.options.styles`

These arrays already contain `projects/ui-common/styles/theme.scss`. Add the new entry after it.

- [ ] **Step 3: Run storybook to verify the stories work**

Run: `npx ng run ui-common:storybook`
Expected: Storybook launches. Navigate to "Framework / Route Transitions / Demo". Clicking links should trigger directional slide transitions.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/framework/route-transitions/stories/route-transitions.stories.ts angular.json
git commit -m "feat(route-transitions): add Storybook demo stories"
```

---

## Chunk 4: Verification and Cleanup

### Task 8: Run full test suite and build

- [ ] **Step 1: Run all route-transitions tests**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern route-transitions --verbose`
Expected: All tests pass (10 + 5 + 4 = 19 tests)

- [ ] **Step 2: Run the library build**

Run: `npx ng build ui-common`
Expected: Build succeeds. Verify these files exist in the output:
- `dist/ui-common/styles/route-transitions.css`
- TypeScript types for `seamRouteTransition`, `SeamRouteShellComponent`, `computeDirection`, `getUrlSegments` in the framework entrypoint

- [ ] **Step 3: Run the existing test suite to verify no regressions**

Run: `npx jest --config projects/ui-common/jest.config.ts`
Expected: All existing tests still pass

- [ ] **Step 4: Final commit if any adjustments were needed**

Only if fixes were required — stage only the specific changed files:

```bash
git add <changed-files>
git commit -m "fix(route-transitions): address issues from verification"
```
