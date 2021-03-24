import { Directive, ElementRef } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutTopBar]'
})
export class BaseLayoutTopBarDirective implements HasElementRef {

  constructor(
    public _elementRef: ElementRef
  ) { }

}
