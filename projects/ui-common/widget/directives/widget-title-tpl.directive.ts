import { Directive, TemplateRef } from '@angular/core'

@Directive({
    selector: '[seamWidgetTitleTpl]',
    standalone: false
})
export class WidgetTitleTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
