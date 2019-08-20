import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core'

import { TabbedTabContentDirective } from '../directives/tabbed-tab-content.directive'
import { TabbedTabDirective } from '../directives/tabbed-tab.directive'

@Component({
  selector: 'seam-tabbed-item',
  templateUrl: './tabbed-item.component.html',
  styleUrls: ['./tabbed-item.component.scss']
})
export class TabbedItemComponent implements OnInit {

  @ContentChild(TabbedTabDirective, { read: TemplateRef, static: true })
  public tabbedTabTpl: TemplateRef<TabbedTabDirective>

  @ContentChild(TabbedTabContentDirective, { read: TemplateRef, static: true })
  public tabbedContentTpl: TemplateRef<TabbedTabContentDirective>

  @Input() name: string
  @Input() label: string
  @Input() contentFromRoute = false

  constructor() { }

  ngOnInit() { }

}
