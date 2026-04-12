import { Component, Input } from '@angular/core'
import { NgIf, NgTemplateOutlet } from '@angular/common'
import { RouterModule } from '@angular/router'

import { TheSeamTabbedItemAccessor } from '../tabbed-models'

@Component({
  selector: 'seam-tabbed-content',
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss'],
  imports: [NgIf, NgTemplateOutlet, RouterModule],
})
export class TheSeamTabbedContentComponent {
  @Input() tabbedItem?: TheSeamTabbedItemAccessor
}
