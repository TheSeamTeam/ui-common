import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalFooterTpl]',
  standalone: false,
})
export class ModalFooterTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
