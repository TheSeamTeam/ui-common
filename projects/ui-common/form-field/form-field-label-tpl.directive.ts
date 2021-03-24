import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldLabelTpl]'
})
export class FormFieldLabelTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
