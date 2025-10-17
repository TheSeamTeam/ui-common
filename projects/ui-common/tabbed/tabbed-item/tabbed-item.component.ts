import { BooleanInput } from '@angular/cdk/coercion'
import { Component, ContentChild, Input, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

import { TheSeamTabbedTabContentDirective } from '../directives/tabbed-tab-content.directive'
import { TheSeamTabbedTabDirective } from '../directives/tabbed-tab.directive'
import { TheSeamTabbedItemAccessor } from '../tabbed-models'

@Component({
  selector: 'seam-tabbed-item',
  templateUrl: './tabbed-item.component.html',
  styleUrls: ['./tabbed-item.component.scss'],
})
export class TheSeamTabbedItemComponent implements TheSeamTabbedItemAccessor {
  static ngAcceptInputType_contentFromRoute: BooleanInput

  @ContentChild(TheSeamTabbedTabDirective, { read: TemplateRef, static: true })
  public tabbedTabTpl?: TemplateRef<TheSeamTabbedTabDirective>

  @ContentChild(TheSeamTabbedTabContentDirective, {
    read: TemplateRef,
    static: true,
  })
  public tabbedContentTpl?: TemplateRef<TheSeamTabbedTabContentDirective>

  @Input() name: string | undefined | null
  @Input() label: string | undefined | null
  @Input() @InputBoolean() contentFromRoute = false
}
