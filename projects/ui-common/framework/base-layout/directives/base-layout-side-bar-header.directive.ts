import { Directive, ElementRef, inject } from '@angular/core'

import { HasElementRef } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamBaseLayoutSideBarHeader]',
  exportAs: 'seamBaseLayoutSideBarHeader',
})
export class BaseLayoutSideBarHeaderDirective implements HasElementRef {
 public readonly _elementRef = inject(ElementRef)
}
