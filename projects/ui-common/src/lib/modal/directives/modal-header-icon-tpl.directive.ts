import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalHeaderIconTpl]'
})
export class ModalHeaderIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
