import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarNavToggleBtnDetail]'
})
export class TopBarNavToggleBtnDetailDirective {

  constructor(public template: TemplateRef<any>) { }

}
