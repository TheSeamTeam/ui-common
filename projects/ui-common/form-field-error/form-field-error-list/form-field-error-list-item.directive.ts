import { Directive, Input, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldErrorListItem]'
})
export class FormFieldErrorListItemDirective {

  @Input() validatorName: string

  constructor(public template: TemplateRef<any>) {}

}
