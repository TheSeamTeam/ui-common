import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardHeaderTpl]',
  standalone: false,
})
export class DataboardHeaderTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
