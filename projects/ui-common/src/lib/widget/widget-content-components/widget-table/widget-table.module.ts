import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamTableModule } from '../../../table/index'

import { WidgetTableComponent } from './widget-table.component'

@NgModule({
  declarations: [
    WidgetTableComponent
  ],
  imports: [
    CommonModule,
    TheSeamTableModule
  ],
  exports: [
    WidgetTableComponent
  ]
})
export class TheSeamWidgetTableModule { }
