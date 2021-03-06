import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@lib/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContent]'
})
export class BaseLayoutContentDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
