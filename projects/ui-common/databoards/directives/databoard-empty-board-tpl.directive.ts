import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardEmptyBoardTpl]',
  standalone: false,
})
export class DataboardEmptyBoardTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
