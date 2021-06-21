import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarMenuBtnDetail]'
})
export class TopBarMenuBtnDetailDirective {

  constructor(public template: TemplateRef<any>) { }

}
