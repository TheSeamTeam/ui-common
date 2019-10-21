import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkTableModule } from '@angular/cdk/table'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamButtonsModule } from '../buttons/index'
import { TheSeamIconModule } from '../icon/icon.module'
import { TheSeamLoadingModule } from '../loading/index'

import { WidgetDragHandleDirective } from './directives/widget-drag-handle.directive'
import { WidgetIconTplDirective } from './directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from './directives/widget-title-tpl.directive'
import { WidgetFooterComponent } from './widget-footer/widget-footer.component'
import { WidgetComponent } from './widget/widget.component'

import { TheSeamWidgetButtonGroupModule } from './widget-content-components/widget-button-group/widget-button-group.module'
import { TheSeamWidgetContentHeaderModule } from './widget-content-components/widget-content-header/widget-content-header.module'
import { TheSeamWidgetDescriptionModule } from './widget-content-components/widget-description/widget-description.module'
import { TheSeamWidgetEmptyLabelModule } from './widget-content-components/widget-empty-label/widget-empty-label.module'
import { TheSeamWidgetFooterLinkModule } from './widget-content-components/widget-footer-link/widget-footer-link.module'
import { TheSeamWidgetFooterTextModule } from './widget-content-components/widget-footer-text/widget-footer-text.module'
import { TheSeamWidgetHeaderBadgeModule } from './widget-content-components/widget-header-badge/widget-header-badge.module'
import { TheSeamWidgetListGroupModule } from './widget-content-components/widget-list-group/widget-list-group.module'
import { TheSeamWidgetTableModule } from './widget-content-components/widget-table/widget-table.module'
import { TheSeamWidgetTileListModule } from './widget-content-components/widget-tile-list/widget-tile-list.module'
import { TheSeamWidgetTileModule } from './widget-content-components/widget-tile/widget-tile.module'

const contentModules = [
  TheSeamWidgetButtonGroupModule,
  TheSeamWidgetContentHeaderModule,
  TheSeamWidgetDescriptionModule,
  TheSeamWidgetEmptyLabelModule,
  TheSeamWidgetFooterLinkModule,
  TheSeamWidgetFooterTextModule,
  TheSeamWidgetHeaderBadgeModule,
  TheSeamWidgetListGroupModule,
  TheSeamWidgetTableModule,
  TheSeamWidgetTileListModule,
  TheSeamWidgetTileModule
]

@NgModule({
  declarations: [
    WidgetComponent,
    WidgetIconTplDirective,
    WidgetTitleTplDirective,
    WidgetDragHandleDirective,
    WidgetFooterComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TheSeamIconModule,
    TheSeamLoadingModule,
    DragDropModule,
    TheSeamButtonsModule,
    CdkTableModule,

    ...contentModules
  ],
  exports: [
    WidgetComponent,
    WidgetIconTplDirective,
    WidgetTitleTplDirective,
    WidgetFooterComponent,

    ...contentModules
  ]
})
export class TheSeamWidgetModule { }
