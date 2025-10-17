import { Directive, ElementRef, HostBinding, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalTitle]',
  standalone: false,
})
export class ModalTitleDirective {
  @HostBinding('class.modal-title') _modalTitleCss = true

  constructor(private _elementRef: ElementRef<HTMLElement>) {}
}
