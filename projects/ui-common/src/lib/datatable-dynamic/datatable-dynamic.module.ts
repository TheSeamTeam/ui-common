import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamDataExporterModule } from '../data-exporter/index'
import { TheSeamDataFiltersModule } from '../data-filters/index'
import { TheSeamDatatableModule } from '../datatable/index'
import { TheSeamIconModule } from '../icon/index'
import { TheSeamSharedModule } from '../shared/index'

import { DatatableDynamicFilterContainerComponent } from './datatable-dynamic-filter-container/datatable-dynamic-filter-container.component'
import { DatatableDynamicComponent } from './datatable-dynamic.component'


@NgModule({
  declarations: [
    DatatableDynamicComponent,
    DatatableDynamicFilterContainerComponent
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    TheSeamDatatableModule,
    TheSeamDataExporterModule,
    TheSeamDataFiltersModule,
    TheSeamIconModule,
    PortalModule,
    RouterModule
  ],
  exports: [
    DatatableDynamicComponent,

    TheSeamDatatableModule
  ]
})
export class TheSeamDatatableDynamicModule { }
