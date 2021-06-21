import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableRowActionItem]'
})
export class DatatableRowActionItemDirective {

  constructor(public template: TemplateRef<any>) { }

}
