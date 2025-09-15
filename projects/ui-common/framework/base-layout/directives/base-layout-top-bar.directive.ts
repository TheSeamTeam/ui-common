import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutTopBar]',
  exportAs: 'seamBaseLayoutTopBar',
})
export class BaseLayoutTopBarDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
