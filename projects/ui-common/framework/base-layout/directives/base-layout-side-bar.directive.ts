import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBar]',
  exportAs: 'seamBaseLayoutSideBar',
})
export class BaseLayoutSideBarDirective implements HasElementRef {
  public readonly _elementRef = inject(ElementRef)
}
