import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDatatableRowActionItem]',
  standalone: false,
})
export class DatatableRowActionItemDirective {

  constructor(public template: TemplateRef<any>) { }

}
