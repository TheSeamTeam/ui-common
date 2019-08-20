import { Directive, Input, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldErrorListItemTpl]'
})
export class FormFieldErrorListItemTplDirective {

  @Input() validatorName: string

  @Input() external = false

  constructor(public template: TemplateRef<any>) {}

}
