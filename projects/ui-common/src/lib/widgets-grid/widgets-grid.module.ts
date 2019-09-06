import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { GridsterModule } from 'angular-gridster2'

import { WidgetsGridComponent } from './widgets-grid.component'

@NgModule({
  declarations: [
    WidgetsGridComponent
  ],
  imports: [
    CommonModule,
    GridsterModule
  ],
  exports: [
    WidgetsGridComponent
  ]
})
export class TheSeamWidgetsGridModule { }
