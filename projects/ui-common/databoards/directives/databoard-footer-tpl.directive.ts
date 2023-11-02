import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardFooterTpl]'
})
export class DataboardFooterTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
