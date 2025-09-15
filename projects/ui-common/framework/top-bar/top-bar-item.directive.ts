import { Directive, inject, Input, TemplateRef } from '@angular/core'

export type TopBarPosition = 'left' | 'right' | 'center'

@Directive({
  selector: '[seamTopBarItem]',
  exportAs: 'seamTopBarItem',
})
export class TopBarItemDirective {
  public readonly template = inject(TemplateRef<any>)

  position: TopBarPosition = 'right'

  @Input() set seamTopBarItem(value: any) {
    this.position = value
  }
}
