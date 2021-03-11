import { CdkTableModule } from '@angular/cdk/table'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

import { TableComponent } from './table/table.component'

@NgModule({
  declarations: [
    TableComponent
  ],
  imports: [
    CommonModule,
    TheSeamTableCellTypesModule,
    CdkTableModule
  ],
  exports: [
    TableComponent,
    TheSeamTableCellTypesModule
  ]
})
export class TheSeamTableModule { }
