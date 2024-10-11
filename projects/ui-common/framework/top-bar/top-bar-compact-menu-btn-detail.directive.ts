import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarCompactMenuBtnDetail]'
})
export class TopBarCompactMenuBtnDetailDirective {

  constructor(public template: TemplateRef<any>) { }

}
