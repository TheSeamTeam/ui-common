import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContentFooter]'
})
export class BaseLayoutContentFooterDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
