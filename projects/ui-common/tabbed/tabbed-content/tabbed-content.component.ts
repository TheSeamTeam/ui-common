import { Component, Input, OnInit } from '@angular/core'

import { TabbedItemAccessor } from '../tabbed-models'

@Component({
  selector: 'seam-tabbed-content',
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss']
})
export class TabbedContentComponent implements OnInit {

  @Input() tabbedItem?: TabbedItemAccessor

  constructor() { }

  ngOnInit() { }

}
