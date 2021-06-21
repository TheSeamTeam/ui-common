import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

import { TabbedTabContentDirective } from '../directives/tabbed-tab-content.directive'
import { TabbedTabDirective } from '../directives/tabbed-tab.directive'

@Component({
  selector: 'seam-tabbed-item',
  templateUrl: './tabbed-item.component.html',
  styleUrls: ['./tabbed-item.component.scss']
})
export class TabbedItemComponent implements OnInit {
  static ngAcceptInputType_contentFromRoute: BooleanInput

  @ContentChild(TabbedTabDirective, { read: TemplateRef, static: true })
  public tabbedTabTpl?: TemplateRef<TabbedTabDirective>

  @ContentChild(TabbedTabContentDirective, { read: TemplateRef, static: true })
  public tabbedContentTpl?: TemplateRef<TabbedTabContentDirective>

  @Input() name: string | undefined | null
  @Input() label: string | undefined | null
  @Input() @InputBoolean() contentFromRoute = false

  constructor() { }

  ngOnInit() { }

}
