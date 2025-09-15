import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutContent]',
  exportAs: 'seamBaseLayoutContent',
})
export class BaseLayoutContentDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
