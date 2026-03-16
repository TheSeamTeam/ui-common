import { Component, inject } from '@angular/core'
import { ActivatedRoute, RouterOutlet } from '@angular/router'

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
