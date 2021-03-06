import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@lib/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBar]'
})
export class BaseLayoutSideBarDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
