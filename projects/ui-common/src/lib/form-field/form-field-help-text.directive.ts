import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldHelpText]'
})
export class FormFieldHelpTextDirective {

  constructor(public template: TemplateRef<any>) { }

}
