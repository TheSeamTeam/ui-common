import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatapageDefaultTpl]'
})
export class DatapageDefaultTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
