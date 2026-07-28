import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDatatableTpl]',
  standalone: false,
})
export class DatapageDatatableTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
