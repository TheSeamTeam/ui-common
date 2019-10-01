import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '../../../core/common-behaviors'

@Directive({
  selector: '[seamBaseLayoutContent]'
})
export class BaseLayoutContentDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
