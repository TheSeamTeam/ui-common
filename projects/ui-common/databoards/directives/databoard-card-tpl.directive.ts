import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardCardTpl]'
})
export class DataboardCardTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
