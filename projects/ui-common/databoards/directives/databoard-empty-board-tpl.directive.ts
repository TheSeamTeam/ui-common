import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardEmptyBoardTpl]'
})
export class DataboardEmptyBoardTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
