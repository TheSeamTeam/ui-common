import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { DatatableCellTypeDateComponent } from './datatable-cell-type-date/datatable-cell-type-date.component'

export const cellTypeComponents = [
  DatatableCellTypeDateComponent
]

@NgModule({
  declarations: [
    ...cellTypeComponents
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ...cellTypeComponents
  ],
  entryComponents: [
    ...cellTypeComponents
  ]
})
export class TheSeamDatatableCellTypesModule { }
