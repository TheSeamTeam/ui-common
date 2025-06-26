import { CdkTableModule } from '@angular/cdk/table'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamTableCellTypeModule } from '@theseam/ui-common/table-cell-type'

import { TableComponent } from './table/table.component'
import { TheSeamTableColumnComponent } from './table-column.component'
import { TheSeamTableCellTplDirective } from './table-cell-tpl.directive'
import { TheSeamTableColumnHeaderTplDirective } from './table-column-header-tpl.directive'

@NgModule({
  declarations: [
    TableComponent
  ],
  imports: [
    CommonModule,
    CdkTableModule,
    TheSeamTableCellTypeModule,
    TheSeamTableColumnComponent,
    TheSeamTableCellTplDirective,
    TheSeamTableColumnHeaderTplDirective,
  ],
  exports: [
    TableComponent,
    TheSeamTableColumnComponent,
    TheSeamTableCellTplDirective,
    TheSeamTableColumnHeaderTplDirective,
  ]
})
export class TheSeamTableModule { }
