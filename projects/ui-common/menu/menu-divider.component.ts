import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-menu-divider',
  template: ``,
  styles: [],
  host: {
    'class': 'dropdown-divider d-block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MenuDividerComponent { }
