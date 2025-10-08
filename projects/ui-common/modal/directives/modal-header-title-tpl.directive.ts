import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalHeaderTitleTpl]',
  standalone: false,
})
export class ModalHeaderTitleTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
