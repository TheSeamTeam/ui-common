import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBarHeader]'
})
export class BaseLayoutSideBarHeaderDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
