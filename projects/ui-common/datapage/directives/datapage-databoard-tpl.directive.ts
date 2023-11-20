import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDataboardTpl]'
})
export class DatapageDataboardTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
