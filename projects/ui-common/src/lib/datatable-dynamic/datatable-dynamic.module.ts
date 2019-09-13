import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamDataExporterModule } from '../data-exporter/index'
import { TheSeamDataFiltersModule } from '../data-filters/index'
import { TheSeamDatatableModule } from '../datatable/index'
import { TheSeamSharedModule } from '../shared/index'

import { DatatableDynamicComponent } from './datatable-dynamic.component'


@NgModule({
  declarations: [
    DatatableDynamicComponent
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    TheSeamDatatableModule,
    TheSeamDataExporterModule,
    TheSeamDataFiltersModule
  ],
  exports: [
    DatatableDynamicComponent,

    TheSeamDatatableModule
  ]
})
export class TheSeamDatatableDynamicModule { }
