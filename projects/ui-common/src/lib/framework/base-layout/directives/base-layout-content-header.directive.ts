import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@lib/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContentHeader]'
})
export class BaseLayoutContentHeaderDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
