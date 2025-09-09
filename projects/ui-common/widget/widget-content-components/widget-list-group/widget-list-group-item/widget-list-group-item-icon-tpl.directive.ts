import { Directive, TemplateRef } from '@angular/core'

@Directive({
    selector: '[seamWidgetListGroupItemIconTpl]',
    exportAs: 'seamWidgetListGroupItemIconTpl',
    standalone: false
})
export class WidgetListGroupItemIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
