import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableRowDetailTpl]',
  standalone: false,
})
export class DatatableRowDetailTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
