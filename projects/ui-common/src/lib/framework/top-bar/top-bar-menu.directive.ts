import { Directive, Self } from '@angular/core'

import { MenuComponent } from '@theseam/ui-common/menu'

@Directive({
  selector: 'seam-menu[seamTopBarMenu]'
})
export class TopBarMenuDirective {

  constructor(
    @Self() public menu: MenuComponent
  ) { }

}
