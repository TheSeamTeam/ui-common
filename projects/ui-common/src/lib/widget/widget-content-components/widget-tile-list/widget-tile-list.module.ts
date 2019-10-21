import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { WidgetTileListComponent } from './widget-tile-list.component'

@NgModule({
  declarations: [
    WidgetTileListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WidgetTileListComponent
  ]
})
export class TheSeamWidgetTileListModule { }
