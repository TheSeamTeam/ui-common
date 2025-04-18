import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBar]'
})
export class BaseLayoutSideBarDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
