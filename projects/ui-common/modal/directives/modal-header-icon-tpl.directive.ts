import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalHeaderIconTpl]',
  standalone: false,
})
export class ModalHeaderIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
