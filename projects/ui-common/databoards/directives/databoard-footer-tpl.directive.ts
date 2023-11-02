import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardFooterTpl]',
  standalone: false,
})
export class DataboardFooterTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
