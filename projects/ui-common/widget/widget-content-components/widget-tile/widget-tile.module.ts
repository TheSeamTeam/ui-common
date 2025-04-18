import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { WidgetTileFooterComponent } from './widget-tile-footer/widget-tile-footer.component'
import { WidgetTileFooterItemComponent } from './widget-tile-footer-item/widget-tile-footer-item.component'
import { WidgetTileGroupComponent } from './widget-tile-group/widget-tile-group.component'
import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-tile.component'

@NgModule({
  declarations: [
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective,
    WidgetTileFooterComponent,
    WidgetTileGroupComponent,
    WidgetTileFooterItemComponent,
  ],
  imports: [
    CommonModule,
    TheSeamIconModule,
  ],
  exports: [
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective,
    WidgetTileFooterComponent,
    WidgetTileGroupComponent,
    WidgetTileFooterItemComponent,
  ],
})
export class TheSeamWidgetTileModule { }
