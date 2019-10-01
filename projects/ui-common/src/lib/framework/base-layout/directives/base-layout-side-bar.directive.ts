import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '../../../core/common-behaviors'

@Directive({
  selector: '[seamBaseLayoutSideBar]'
})
export class BaseLayoutSideBarDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
