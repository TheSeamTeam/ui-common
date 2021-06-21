import { Component, Input, OnInit } from '@angular/core'

import { TabbedItemComponent } from '../tabbed-item/tabbed-item.component'

@Component({
  selector: 'seam-tabbed-content',
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss']
})
export class TabbedContentComponent implements OnInit {

  @Input() tabbedItem?: TabbedItemComponent

  constructor() { }

  ngOnInit() { }

}
