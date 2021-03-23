import { CdkTableModule } from '@angular/cdk/table'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamTableCellTypeModule } from '@lib/ui-common/table-cell-type'

import { TableComponent } from './table/table.component'

@NgModule({
  declarations: [
    TableComponent
  ],
  imports: [
    CommonModule,
    CdkTableModule,
    TheSeamTableCellTypeModule
  ],
  exports: [
    TableComponent
  ]
})
export class TheSeamTableModule { }
