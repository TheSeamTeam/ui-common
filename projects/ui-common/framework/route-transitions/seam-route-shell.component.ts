import { Component, inject } from '@angular/core'
import { ActivatedRoute, RouterOutlet } from '@angular/router'

/**
 * A reusable shell component that wraps a `<router-outlet>` with automatic
 * directional slide transitions powered by the View Transition API.
 *
 * Use this as a parent route component in place of custom "Base" components.
 * It eliminates the need for per-module animation boilerplate and
 * `routeTransitionId` route data.
 *
 * ### Setup (one-time per app)
 *
 * 1. Register the transition callback in your router config:
 *    ```typescript
 *    import { seamRouteTransition } from '@theseam/ui-common'
 *
 *    provideRouter(
 *      routes,
 *      withViewTransitions({ onViewTransitionCreated: seamRouteTransition() })
 *    )
 *    ```
 *
 * 2. Import the transition stylesheet in your global styles:
 *    ```scss
 *    @import '@theseam/ui-common/framework/route-transitions/route-transitions';
 *    ```
 *
 * ### Usage in route configs
 *
 * ```typescript
 * import { SeamRouteShellComponent } from '@theseam/ui-common'
 *
 * const routes: Routes = [
 *   {
 *     path: '',
 *     component: SeamRouteShellComponent,
 *     children: [
 *       { path: '', component: ClaimsTableComponent },
 *       { path: ':id', component: ClaimDetailComponent },
 *     ],
 *   },
 * ]
 * ```
 *
 * ### Transition behavior
 *
 * Direction is determined automatically by comparing route URL segments:
 * - **Sibling** — same parent, different child: current slides right, new slides left.
 * - **Deeper** — navigating to a child route: both slide left.
 * - **Shallower** — navigating to a parent route: both slide right.
 * - **Cross-branch** — different sections entirely: treated as sibling of the
 *   deepest shared ancestor.
 *
 * ### Customization
 *
 * Override CSS custom properties to adjust timing:
 * ```css
 * :root {
 *   --seam-route-transition-duration: 300ms;
 *   --seam-route-transition-easing: ease-out;
 * }
 * ```
 *
 * Transitions are automatically disabled when the user has
 * `prefers-reduced-motion: reduce` enabled.
 *
 * ### Nesting
 *
 * Multiple `SeamRouteShellComponent` instances can be nested at different
 * route depths. Each instance receives a unique `view-transition-name`
 * based on its depth in the route tree to avoid conflicts.
 */
@Component({
  selector: 'seam-route-shell',
  template: `<router-outlet></router-outlet>`,
  host: {
    '[style.view-transition-name]': 'transitionName',
    '[style.display]': '"flex"',
    '[style.flex-direction]': '"column"',
    '[style.height]': '"100%"',
  },
  imports: [RouterOutlet],
  standalone: true,
})
export class SeamRouteShellComponent {
  private readonly route = inject(ActivatedRoute)

  /** Unique view-transition-name based on route depth to avoid duplicates when nested. */
  protected readonly transitionName = `seam-route-content-${this.getRouteDepth()}`

  private getRouteDepth(): number {
    let depth = 0
    let current = this.route.snapshot
    while (current.parent) {
      depth++
      current = current.parent
    }
    return depth
  }
}
