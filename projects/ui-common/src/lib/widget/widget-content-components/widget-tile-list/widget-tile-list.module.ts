import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamWidgetTileModule } from '../widget-tile/widget-tile.module'

import { WidgetTileListComponent } from './widget-tile-list.component'

@NgModule({
  declarations: [
    WidgetTileListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetTileListComponent,
    TheSeamWidgetTileModule
  ]
})
export class TheSeamWidgetTileListModule { }
