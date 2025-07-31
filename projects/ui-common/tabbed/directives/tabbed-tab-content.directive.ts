import { Directive } from '@angular/core'

import { TheSeamTabbedTabContentAccessor } from '../tabbed-models'

@Directive({
  selector: '[seamTabbedTabContent]',
  exportAs: 'seamTabbedTabContent'
})
export class TheSeamTabbedTabContentDirective implements TheSeamTabbedTabContentAccessor {

  public isActive = false

}
