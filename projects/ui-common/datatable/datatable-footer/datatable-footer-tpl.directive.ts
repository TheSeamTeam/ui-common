import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableFooterTpl]',
  standalone: false,
})
export class DatatableFooterTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
