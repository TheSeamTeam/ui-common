import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamWidgetTitleTpl]'
})
export class WidgetTitleTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
