import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkTableModule } from '@angular/cdk/table'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamButtonsModule } from '../buttons/index'
import { TheSeamIconModule } from '../icon/icon.module'
import { TheSeamLoadingModule } from '../loading/index'
import { TheSeamTableModule } from '../table/index'

import { WidgetDragHandleDirective } from './directives/widget-drag-handle.directive'
import { WidgetIconTplDirective } from './directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from './directives/widget-title-tpl.directive'
import { WidgetButtonGroupComponent } from './widget-content-components/widget-button-group/widget-button-group.component'
import { WidgetContentHeaderComponent } from './widget-content-components/widget-content-header/widget-content-header.component'
import { WidgetDescriptionComponent } from './widget-content-components/widget-description/widget-description.component'
import { WidgetEmptyLabelComponent } from './widget-content-components/widget-empty-label/widget-empty-label.component'
import { WidgetFooterLinkComponent } from './widget-content-components/widget-footer-link/widget-footer-link.component'
import { WidgetFooterTextComponent } from './widget-content-components/widget-footer-text/widget-footer-text.component'
import { WidgetHeaderBadgeComponent } from './widget-content-components/widget-header-badge/widget-header-badge.component'
import {
  WidgetListGroupItemAnchorComponent,
  WidgetListGroupItemButtonComponent,
  WidgetListGroupItemComponent
} from './widget-content-components/widget-list-group-item/widget-list-group-item.component'
import { WidgetListGroupComponent } from './widget-content-components/widget-list-group/widget-list-group.component'
import { WidgetTableComponent } from './widget-content-components/widget-table/widget-table.component'
import { WidgetTileListComponent } from './widget-content-components/widget-tile-list/widget-tile-list.component'
import { WidgetTileSecondaryIconDirective } from './widget-content-components/widget-tile/widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-content-components/widget-tile/widget-tile.component'
import { WidgetFooterComponent } from './widget-footer/widget-footer.component'
import { WidgetComponent } from './widget/widget.component'

@NgModule({
  declarations: [
    WidgetComponent,
    WidgetIconTplDirective,
    WidgetTitleTplDirective,
    WidgetFooterTextComponent,
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective,
    WidgetHeaderBadgeComponent,
    WidgetFooterLinkComponent,
    WidgetTileListComponent,
    WidgetEmptyLabelComponent,
    WidgetContentHeaderComponent,
    WidgetDragHandleDirective,
    WidgetTableComponent,
    WidgetDescriptionComponent,
    WidgetButtonGroupComponent,
    WidgetFooterComponent,
    WidgetListGroupComponent,
    WidgetListGroupItemComponent,
    WidgetListGroupItemButtonComponent,
    WidgetListGroupItemAnchorComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TheSeamIconModule,
    TheSeamLoadingModule,
    DragDropModule,
    TheSeamButtonsModule,
    CdkTableModule,
    TheSeamTableModule
  ],
  exports: [
    WidgetComponent,
    WidgetIconTplDirective,
    WidgetTitleTplDirective,
    WidgetFooterTextComponent,
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective,
    WidgetHeaderBadgeComponent,
    WidgetFooterLinkComponent,
    WidgetTileListComponent,
    WidgetEmptyLabelComponent,
    WidgetContentHeaderComponent,
    WidgetTableComponent,
    WidgetDescriptionComponent,
    WidgetButtonGroupComponent,
    WidgetFooterComponent,
    WidgetListGroupComponent,
    WidgetListGroupItemComponent,
    WidgetListGroupItemButtonComponent,
    WidgetListGroupItemAnchorComponent
  ]
})
export class TheSeamWidgetModule { }
