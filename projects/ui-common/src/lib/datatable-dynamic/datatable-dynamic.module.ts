import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamDatatableModule } from '../datatable/index'

import { DatatableDynamicComponent } from './datatable-dynamic.component'


@NgModule({
  declarations: [
    DatatableDynamicComponent
  ],
  imports: [
    CommonModule,
    TheSeamDatatableModule
  ],
  exports: [
    DatatableDynamicComponent,

    TheSeamDatatableModule
  ]
})
export class TheSeamDatatableDynamicModule { }
