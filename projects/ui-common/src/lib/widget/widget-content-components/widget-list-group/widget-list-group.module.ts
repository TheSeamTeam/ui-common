import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import {
  WidgetListGroupItemAnchorComponent,
  WidgetListGroupItemButtonComponent,
  WidgetListGroupItemComponent
} from './widget-list-group-item/widget-list-group-item.component'
import { WidgetListGroupComponent } from './widget-list-group.component'

@NgModule({
  declarations: [
    WidgetListGroupComponent,
    WidgetListGroupItemAnchorComponent,
    WidgetListGroupItemButtonComponent,
    WidgetListGroupItemComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetListGroupComponent,
    WidgetListGroupItemAnchorComponent,
    WidgetListGroupItemButtonComponent,
    WidgetListGroupItemComponent
  ]
})
export class TheSeamWidgetListGroupModule { }
