import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-menu-divider',
  template: ``,
  styles: [],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'class': 'dropdown-divider d-block'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuDividerComponent { }
