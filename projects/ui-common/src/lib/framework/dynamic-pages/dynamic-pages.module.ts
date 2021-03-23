import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamDatatableDynamicModule } from '@lib/ui-common/datatable-dynamic'
import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

import { TheSeamDynamicRouterModule } from '../dynamic-router/dynamic-router.module'

import { DynamicDatatablePageComponent } from './dynamic-datatable-page/dynamic-datatable-page.component'

@NgModule({
  declarations: [
    DynamicDatatablePageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamDynamicRouterModule,
    TheSeamDatatableDynamicModule,
    TheSeamTableCellTypesModule
  ],
  exports: [
    DynamicDatatablePageComponent
  ],
  entryComponents: [
    DynamicDatatablePageComponent
  ]
})
export class DynamicPagesModule { }
