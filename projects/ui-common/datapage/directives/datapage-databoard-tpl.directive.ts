import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDataboardTpl]',
  standalone: false,
})
export class DatapageDataboardTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
