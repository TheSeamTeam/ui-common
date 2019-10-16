import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '../../../core/common-behaviors'

@Directive({
  selector: '[seamBaseLayoutContentFooter]'
})
export class BaseLayoutContentFooterDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
