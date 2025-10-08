import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamWidgetIconTpl]',
  standalone: false,
})
export class WidgetIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
