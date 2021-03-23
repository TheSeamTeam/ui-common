import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamTableModule } from '@lib/ui-common/table'
import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

import { WidgetTableComponent } from './widget-table.component'

@NgModule({
  declarations: [
    WidgetTableComponent
  ],
  imports: [
    CommonModule,
    TheSeamTableModule,
    TheSeamTableCellTypesModule
  ],
  exports: [
    WidgetTableComponent
  ]
})
export class TheSeamWidgetTableModule { }
