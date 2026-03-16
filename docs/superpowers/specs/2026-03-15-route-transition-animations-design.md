# Route Transition Animations Design

**Date:** 2026-03-15
**Status:** Draft
**Scope:** `@theseam/ui-common` library + app migration pattern

## Problem

Each app that uses route transition animations must create per-module "Base components" — boilerplate components whose sole purpose is to host a `<router-outlet>` and define `@angular/animations` triggers. Every Base component is a near-identical clone, differing only in trigger names. Routes also require `routeTransitionId` data properties for the animation state machine. This creates unnecessary duplication across ~5-6 apps and makes adding new routed modules tedious.

The existing `@angular/animations`-based approach is also deprecated in favor of modern browser APIs.

## Goals

- Eliminate per-module Base components — replace with a single reusable shell component from `@theseam/ui-common`
- Eliminate `routeTransitionId` route data — direction detection should be automatic
- Provide consistent, directional route transitions with zero per-route configuration
- Respect `prefers-reduced-motion` by default
- Work seamlessly with lazy-loaded modules at any nesting level
- Keep developer touchpoints minimal — one-time app setup, then just use routes normally

## Non-Goals

- Ordered sibling transitions (e.g., forward/backward based on tab position) — may be added later if needed
- Custom per-route animations — out of scope for initial implementation
- Supporting browsers without View Transition API — graceful degradation (instant navigation, no animation) is acceptable

## Transition Behavior

Transitions are directional based on the relationship between the previous and next routes:

| Navigation | Direction | Old element | New element |
|------------|-----------|-------------|-------------|
| Same-depth siblings (shared parent) | Sibling swap | Slides right (out) | Slides left (in) |
| Navigating deeper (e.g., `/claims` to `/claims/123`) | Deeper | Slides left (out) | Slides left (in) |
| Navigating shallower (e.g., `/claims/123` to `/claims`) | Shallower | Slides right (out) | Slides right (in) |

### Direction Detection Algorithm

Direction is determined by the **shared path prefix**, not raw depth comparison. This correctly handles cross-branch navigation.

**Algorithm:**

1. Split previous and next URLs into path segments
2. Find the longest shared prefix (segments that match from the start)
3. Compare the remaining segments after the shared prefix:
   - Next has more remaining segments than previous -> **deeper**
   - Previous has more remaining segments than next -> **shallower**
   - Both have the same number of remaining segments -> **sibling**

**Examples:**

```
/claims -> /purchase-orders
  shared: /  |  prev remainder: [claims]  |  next remainder: [purchase-orders]
  -> sibling (both one segment past shared root)

/claims/123/edit -> /purchase-orders/456
  shared: /  |  prev remainder: [claims,123,edit]  |  next remainder: [purchase-orders,456]
  -> sibling (at the root level — switched sections)

/claims -> /claims/123
  shared: /claims  |  prev remainder: []  |  next remainder: [123]
  -> deeper

/claims/123 -> /claims
  shared: /claims  |  prev remainder: [123]  |  next remainder: []
  -> shallower

/claims/123/edit -> /purchase-orders
  shared: /  |  prev remainder: [claims,123,edit]  |  next remainder: [purchase-orders]
  -> shallower (cross-branch, prev has more remaining segments)

/purchase-orders -> /claims/123/edit
  shared: /  |  prev remainder: [purchase-orders]  |  next remainder: [claims,123,edit]
  -> deeper (cross-branch, next has more remaining segments)
```

## Architecture

The solution uses the **View Transition API** via Angular's built-in `withViewTransitions()` router feature, combined with CSS animations for the visual transitions.

### Why View Transitions

- **Browser-native** — the browser captures a bitmap screenshot of the old state and animates to the new DOM. No element cloning, no lifecycle management, no scroll position loss.
- **Angular integration** — `withViewTransitions()` (available since Angular 17) provides a clean hook via `onViewTransitionCreated`. Note: `ViewTransitionInfo` is marked `@developerPreview` as of Angular 20, meaning the API surface may change in future Angular versions. This is acceptable given that the integration surface is small (a single callback) and easy to update.
- **Graceful degradation** — browsers without View Transition API support simply navigate instantly. The app remains fully usable.
- **Performance** — animations run on the compositor thread, off the main thread.
- **`prefers-reduced-motion`** — trivially handled via CSS media query.

### Exports from `@theseam/ui-common`

| Export | Type | Purpose |
|--------|------|---------|
| `seamRouteTransition()` | Function | Factory for `withViewTransitions()` callback. Detects navigation direction and sets `data-route-direction` attribute on `<html>`. |
| `SeamRouteShellComponent` | Standalone Component | Drop-in replacement for all per-module Base components. Hosts `<router-outlet>` with unique `view-transition-name`. |
| `@theseam/ui-common/styles/route-transitions` | CSS Stylesheet | Animation keyframes, direction-based rules, and `prefers-reduced-motion` handling. |

### `seamRouteTransition()` — Direction Detection

A factory function that returns a callback compatible with `withViewTransitions({ onViewTransitionCreated })`.

Note: The code below is **pseudocode illustrating intent**. The exact `ViewTransitionInfo` shape and property names must be verified against the project's installed Angular version during implementation, as this interface is marked `@developerPreview` and may differ across Angular versions.

```typescript
import { ViewTransitionInfo } from '@angular/router'

export function seamRouteTransition(): (info: ViewTransitionInfo) => void {
  return (info: ViewTransitionInfo) => {
    // Property names (from/to) are illustrative — verify against actual Angular API
    const prevSegments = getUrlSegments(info.from)
    const nextSegments = getUrlSegments(info.to)
    const direction = computeDirection(prevSegments, nextSegments)
    document.documentElement.dataset['routeDirection'] = direction
  }
}

function getUrlSegments(snapshot: ActivatedRouteSnapshot): string[] {
  const segments: string[] = []
  let current: ActivatedRouteSnapshot | null = snapshot
  while (current) {
    segments.push(...current.url.map(s => s.path))
    current = current.firstChild
  }
  return segments
}

function computeDirection(prev: string[], next: string[]): 'sibling' | 'deeper' | 'shallower' {
  // Find shared prefix length
  let shared = 0
  while (shared < prev.length && shared < next.length && prev[shared] === next[shared]) {
    shared++
  }

  const prevRemaining = prev.length - shared
  const nextRemaining = next.length - shared

  if (nextRemaining > prevRemaining) return 'deeper'
  if (prevRemaining > nextRemaining) return 'shallower'
  return 'sibling'
}
```

### `SeamRouteShellComponent` — Reusable Shell

Replaces all per-module Base components. Sets `view-transition-name: seam-route-content` so the CSS route transition rules target it. Since only one shell level transitions at a time during any given navigation, a shared name is sufficient — multiple shells at different nesting levels don't animate simultaneously.

```typescript
@Component({
  selector: 'seam-route-shell',
  template: `<router-outlet></router-outlet>`,
  host: {
    '[style.view-transition-name]': 'transitionName',
    '[style.display]': '"flex"',
    '[style.flex-direction]': '"column"',
    '[style.height]': '"100%"',
  },
  standalone: true,
})
export class SeamRouteShellComponent {
  private route = inject(ActivatedRoute)

  protected readonly transitionName = 'seam-route-content'
}
```

### CSS Stylesheet — `route-transitions`

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

/*
 * Target the default "root" view transition name. Elements with explicit
 * view-transition-name values (e.g., SeamRouteShellComponent's
 * seam-route-content-{depth}) participate as named transitions and are
 * targeted separately below.
 *
 * Only seam-route-content-* names are targeted — other view transitions
 * in the app (e.g., shared element animations) are not affected.
 */

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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root),
  ::view-transition-old(seam-route-content),
  ::view-transition-new(seam-route-content) {
    animation-duration: 0s !important;
  }
}
```

**Scoping decision:** The CSS explicitly targets `::view-transition-old(root)` and `::view-transition-old(seam-route-content)` (and their `new` counterparts). This scopes route animations to only the default document transition and seam shell components. Other `view-transition-name` values in the app (e.g., shared element animations) are not affected by these rules. A single shared name `seam-route-content` is used rather than depth-suffixed names, since only one shell level transitions at a time during any navigation.

## App Integration

### One-Time Setup (per app)

**1. Router configuration:**

```typescript
// app.config.ts or app-routing.module.ts
import { seamRouteTransition } from '@theseam/ui-common'

provideRouter(
  routes,
  withViewTransitions({ onViewTransitionCreated: seamRouteTransition() })
)
```

**2. Import stylesheet:**

```css
/* styles.css or styles.scss */
@import '@theseam/ui-common/styles/route-transitions';
```

**3. Replace Base components in route configs:**

```typescript
// Before
import { ClaimsBaseComponent } from './claims-base.component'

{ path: '', component: ClaimsBaseComponent, children: [
    { path: '', component: ClaimsTableComponent, data: { routeTransitionId: 'claims-table' } },
    { path: ':id', component: ClaimDetailComponent, data: { routeTransitionId: 'claim-detail' } },
]}

// After
import { SeamRouteShellComponent } from '@theseam/ui-common'

{ path: '', component: SeamRouteShellComponent, children: [
    { path: '', component: ClaimsTableComponent },
    { path: ':id', component: ClaimDetailComponent },
]}
```

**4. Delete Base components and remove `routeTransitionId` from route data.**

### Components with Their Own Router Outlets

If a component like `BaseLayoutComponent` already has a `<router-outlet>` (e.g., alongside a sidebar and header), it does not use `SeamRouteShellComponent`. Instead, it adds `view-transition-name` to the outlet's container:

```html
<!-- base-layout.component.html -->
<app-sidebar></app-sidebar>
<main style="view-transition-name: seam-route-content">
  <router-outlet></router-outlet>
</main>
```

This scopes the transition animation to the content area, leaving the sidebar and header static during navigation.

## Browser Support & Degradation

- **Chrome 111+** (March 2023), **Edge 111+**, **Firefox 117+** (August 2023), **Safari 18+** (September 2024) — full support
- **Older browsers** — `withViewTransitions()` checks for API support. If unavailable, navigation works normally with no animation. The app is fully usable.
- No polyfill needed. No feature detection code in the app.

## Customization

| Property | Default | Purpose |
|----------|---------|---------|
| `--seam-route-transition-duration` | `400ms` | Animation duration |
| `--seam-route-transition-easing` | `ease-in-out` | Animation easing function |

Apps override these in their global `:root` styles.

## File Structure in ui-common

**TypeScript exports** (via `framework` secondary entrypoint):

```text
projects/ui-common/
  framework/
    route-transitions/
      index.ts                          # Public API barrel
      seam-route-transition.ts          # seamRouteTransition() factory
      seam-route-shell.component.ts     # SeamRouteShellComponent
```

Apps import TypeScript exports as: `import { seamRouteTransition, SeamRouteShellComponent } from '@theseam/ui-common/framework'`

**CSS stylesheet** (separate path for style imports):

```text
projects/ui-common/
  styles/
    route-transitions.css               # Animation keyframes and direction rules
```

Apps import the stylesheet as: `@import '@theseam/ui-common/styles/route-transitions'`

The CSS distribution mechanism (secondary entrypoint, `ng-package.json` assets, or `styleIncludePaths`) should follow whatever pattern ui-common already uses for shared stylesheets. If no pattern exists, the implementation should establish one.

**`view-transition-name` convention:** The naming pattern is `seam-route-content` for CSS targeting. Components manually setting `view-transition-name` (e.g., `BaseLayoutComponent`) should use this same name to participate in route transition animations.

## Testing Strategy

- **Unit tests** for `computeDirection()` — verify all direction cases including cross-branch navigation
- **Unit tests** for `getUrlSegments()` — verify segment extraction from route snapshots
- **Integration test** with `provideRouter()` + `provideLocationMocks()` — verify `data-route-direction` attribute is set correctly on navigation
- **Storybook stories** — visual demonstration of all three transition directions. The existing `dynamic-router` module (`projects/ui-common/framework/dynamic-router/`) is unused by any app and was an earlier experimental attempt at solving this same problem. It can be deprecated and eventually removed once this implementation is validated
- **Manual testing** — verify `prefers-reduced-motion` behavior, verify graceful degradation in older browsers (if available)
