import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamIconModule } from '../icon/icon.module'
import { TheSeamLoadingModule } from '../loading'

import { WidgetIconTplDirective } from './directives/widget-icon-tpl.directive'
import { WidgetTitleTplDirective } from './directives/widget-title-tpl.directive'
import { WidgetContentHeaderComponent } from './widget-content-components/widget-content-header/widget-content-header.component'
import { WidgetEmptyLabelComponent } from './widget-content-components/widget-empty-label/widget-empty-label.component'
import { WidgetFooterLinkComponent } from './widget-content-components/widget-footer-link/widget-footer-link.component'
import { WidgetFooterTextComponent } from './widget-content-components/widget-footer-text/widget-footer-text.component'
import { WidgetHeaderBadgeComponent } from './widget-content-components/widget-header-badge/widget-header-badge.component'
import { WidgetTileListComponent } from './widget-content-components/widget-tile-list/widget-tile-list.component'
import { WidgetTileSecondaryIconDirective } from './widget-content-components/widget-tile/widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-content-components/widget-tile/widget-tile.component'
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
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TheSeamIconModule,
    TheSeamLoadingModule
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
    WidgetContentHeaderComponent
  ]
})
export class TheSeamWidgetModule { }
