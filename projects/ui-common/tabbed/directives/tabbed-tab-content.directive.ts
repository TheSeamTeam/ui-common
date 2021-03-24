import { Directive } from '@angular/core'

@Directive({
  selector: '[seamTabbedTabContent]',
  exportAs: 'seamTabbedTabContent'
})
export class TabbedTabContentDirective {

  public isActive = false

  constructor() { }

}
