import { Component, Input } from '@angular/core'

import { TabbedItemAccessor } from '../tabbed-models'

@Component({
  selector: 'seam-tabbed-content',
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss']
})
export class TabbedContentComponent {

  @Input() tabbedItem?: TabbedItemAccessor

}
