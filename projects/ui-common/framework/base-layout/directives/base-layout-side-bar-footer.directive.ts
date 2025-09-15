import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBarFooter]',
  exportAs: 'seamBaseLayoutSideBarFooter',
})
export class BaseLayoutSideBarFooterDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
