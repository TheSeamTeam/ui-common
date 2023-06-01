import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, Input, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

import { TabbedTabContentDirective } from '../directives/tabbed-tab-content.directive'
import { TabbedTabDirective } from '../directives/tabbed-tab.directive'
import { TabbedItemAccessor } from '../tabbed-models'

@Component({
  selector: 'seam-tabbed-item',
  templateUrl: './tabbed-item.component.html',
  styleUrls: ['./tabbed-item.component.scss']
})
export class TabbedItemComponent implements TabbedItemAccessor {
  static ngAcceptInputType_contentFromRoute: BooleanInput

  @ContentChild(TabbedTabDirective, { read: TemplateRef, static: true })
  public tabbedTabTpl?: TemplateRef<TabbedTabDirective>

  @ContentChild(TabbedTabContentDirective, { read: TemplateRef, static: true })
  public tabbedContentTpl?: TemplateRef<TabbedTabContentDirective>

  @Input() name: string | undefined | null
  @Input() label: string | undefined | null
  @Input() @InputBoolean() contentFromRoute = false
}
