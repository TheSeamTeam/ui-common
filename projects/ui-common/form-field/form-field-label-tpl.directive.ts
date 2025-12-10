import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldLabelTpl]',
  standalone: false,
})
export class FormFieldLabelTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
