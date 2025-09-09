import { Directive, TemplateRef } from '@angular/core'

@Directive({
    selector: '[seamFormFieldHelpText]',
    standalone: false
})
export class FormFieldHelpTextDirective {

  constructor(public template: TemplateRef<any>) { }

}
