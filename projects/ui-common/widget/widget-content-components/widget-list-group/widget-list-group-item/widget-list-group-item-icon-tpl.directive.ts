import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamWidgetListGroupItemIconTpl]',
  exportAs: 'seamWidgetListGroupItemIconTpl'
})
export class WidgetListGroupItemIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
