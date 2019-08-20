import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamModalHeaderTitleTpl]'
})
export class ModalHeaderTitleTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
