import { Directive, inject } from '@angular/core'

import { MenuComponent } from '@theseam/ui-common/menu'

@Directive({
  selector: 'seam-menu[seamTopBarMenu]',
  exportAs: 'seamTopBarMenu',
})
export class TopBarMenuDirective {
  public readonly menu = inject(MenuComponent, { self: true })
}
