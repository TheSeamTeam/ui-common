import { Directive, Self } from '@angular/core'

import { MenuComponent } from '../../menu/menu.component'

@Directive({
  selector: 'seam-menu[seamTopBarMenu]'
})
export class TopBarMenuDirective {

  constructor(
    @Self() public menu: MenuComponent
  ) { }

}
