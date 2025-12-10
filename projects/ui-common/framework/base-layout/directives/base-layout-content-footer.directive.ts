import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContentFooter]',
  exportAs: 'seamBaseLayoutContentFooter',
})
export class BaseLayoutContentFooterDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
