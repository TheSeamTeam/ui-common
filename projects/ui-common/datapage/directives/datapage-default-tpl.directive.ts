import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDefaultTpl]',
  standalone: false,
})
export class DatapageDefaultTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
