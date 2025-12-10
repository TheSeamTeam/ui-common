import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContentHeader]',
  exportAs: 'seamBaseLayoutContentHeader',
})
export class BaseLayoutContentHeaderDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
