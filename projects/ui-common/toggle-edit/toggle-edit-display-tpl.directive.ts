import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamToggleEditDisplayTpl]'
})
export class ToggleEditDisplayTplDirective {

  constructor(public template: TemplateRef<any>) {}

}
