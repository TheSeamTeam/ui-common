import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarItem]'
})
export class TopBarItemDirective {

  constructor(public template: TemplateRef<any>) { }

}
