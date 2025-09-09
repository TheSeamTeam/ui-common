import { Directive, TemplateRef } from '@angular/core'

@Directive({
    selector: '[seamDatatableCellTpl]',
    standalone: false
})
export class DatatableCellTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
