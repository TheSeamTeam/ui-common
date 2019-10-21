import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '../../../icon/icon.module'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-tile.component'

@NgModule({
  declarations: [
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective
  ],
  imports: [
    CommonModule,
    TheSeamIconModule
  ],
  exports: [
    WidgetTileComponent,
    WidgetTileSecondaryIconDirective
  ]
})
export class TheSeamWidgetTileModule { }
