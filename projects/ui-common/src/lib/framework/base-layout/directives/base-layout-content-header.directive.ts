import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '../../../core/common-behaviors'

@Directive({
  selector: '[seamBaseLayoutContentHeader]'
})
export class BaseLayoutContentHeaderDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
