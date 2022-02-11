import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableFooterTpl]'
})
export class DatatableFooterTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
