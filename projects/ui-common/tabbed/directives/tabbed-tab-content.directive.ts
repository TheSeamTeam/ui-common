import { Directive } from '@angular/core'

import { TabbedTabContentAccessor } from '../tabbed-models'

@Directive({
  selector: '[seamTabbedTabContent]',
  exportAs: 'seamTabbedTabContent'
})
export class TabbedTabContentDirective implements TabbedTabContentAccessor {

  public isActive = false

  constructor() { }

}
