import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableColumnFilterTpl]',
  standalone: false,
})
export class DatatableColumnFilterTplDirective {

  constructor(public template: TemplateRef<any>) {}

}
