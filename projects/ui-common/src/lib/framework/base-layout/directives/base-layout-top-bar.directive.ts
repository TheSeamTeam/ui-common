import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '../../../core/common-behaviors'

@Directive({
  selector: '[seamBaseLayoutTopBar]'
})
export class BaseLayoutTopBarDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
