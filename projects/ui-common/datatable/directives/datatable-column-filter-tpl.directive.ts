import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableColumnFilterTpl]'
})
export class DatatableColumnFilterTplDirective {

  constructor(public template: TemplateRef<any>) {}

}
