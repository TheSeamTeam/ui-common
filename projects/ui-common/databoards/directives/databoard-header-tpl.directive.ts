import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardHeaderTpl]'
})
export class DataboardHeaderTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
