import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '../../../icon/index'

import { WidgetListGroupItemIconTplDirective } from './widget-list-group-item/widget-list-group-item-icon-tpl.directive'
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
    WidgetListGroupItemComponent,
    WidgetListGroupItemIconTplDirective
  ],
  imports: [
    CommonModule,
    TheSeamIconModule
  ],
  exports: [
    WidgetListGroupComponent,
    WidgetListGroupItemAnchorComponent,
    WidgetListGroupItemButtonComponent,
    WidgetListGroupItemComponent,
    WidgetListGroupItemIconTplDirective
  ]
})
export class TheSeamWidgetListGroupModule { }
