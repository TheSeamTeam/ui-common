import { Directive, Input, TemplateRef } from '@angular/core'

export type TopBarPosition = 'left' | 'right' | 'center'

@Directive({
  selector: '[seamTopBarItem]'
})
export class TopBarItemDirective {

  position: TopBarPosition = 'right'
  @Input() set seamTopBarItem(value: any) {
    this.position = value
  }

  constructor(public template: TemplateRef<any>) { }

}
