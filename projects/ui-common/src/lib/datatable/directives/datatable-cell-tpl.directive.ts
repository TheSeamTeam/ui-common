import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableCellTpl]'
})
export class DatatableCellTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
