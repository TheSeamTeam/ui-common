import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamWidgetIconTpl]'
})
export class WidgetIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
