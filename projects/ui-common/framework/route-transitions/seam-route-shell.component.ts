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
