import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamIconModule } from '../../icon/index'
import { TheSeamSharedModule } from '../../shared/index'

import { DatatableCellTypeDateComponent } from './datatable-cell-type-date/datatable-cell-type-date.component'
import { DatatableCellTypeIconComponent } from './datatable-cell-type-icon/datatable-cell-type-icon.component'

export const cellTypeComponents = [
  DatatableCellTypeDateComponent,
  DatatableCellTypeIconComponent
]

@NgModule({
  declarations: [
    ...cellTypeComponents
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamSharedModule,
    TheSeamIconModule
  ],
  exports: [
    ...cellTypeComponents
  ],
  entryComponents: [
    ...cellTypeComponents
  ]
})
export class TheSeamDatatableCellTypesModule { }
