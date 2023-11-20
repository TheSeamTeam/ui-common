import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDatatableTpl]'
})
export class DatapageDatatableTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
