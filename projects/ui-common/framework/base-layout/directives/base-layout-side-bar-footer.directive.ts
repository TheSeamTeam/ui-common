import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBarFooter]'
})
export class BaseLayoutSideBarFooterDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
