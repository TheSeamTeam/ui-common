import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalFooterTpl]'
})
export class ModalFooterTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
