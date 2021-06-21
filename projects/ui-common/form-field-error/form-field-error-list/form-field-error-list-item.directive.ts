import { Directive, Input, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldErrorListItem]'
})
export class FormFieldErrorListItemDirective {

  @Input() validatorName: string | undefined | null

  constructor(public template: TemplateRef<any>) {}

}
