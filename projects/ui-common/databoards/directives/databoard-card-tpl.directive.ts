import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamDataboardCardTpl]',
  standalone: false,
})
export class DataboardCardTplDirective {
  constructor(public template: TemplateRef<any>) {}
}
