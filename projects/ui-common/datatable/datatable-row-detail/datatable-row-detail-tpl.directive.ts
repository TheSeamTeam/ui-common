import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableRowDetailTpl]'
})
export class DatatableRowDetailTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
