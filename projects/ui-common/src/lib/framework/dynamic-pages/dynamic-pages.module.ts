import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamDynamicRouterModule } from '../dynamic-router/dynamic-router.module'

import { TheSeamDatatableDynamicModule } from '../../datatable-dynamic/datatable-dynamic.module'
import { DynamicDatatablePageComponent } from './dynamic-datatable-page/dynamic-datatable-page.component'

@NgModule({
  declarations: [
    DynamicDatatablePageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamDynamicRouterModule,
    TheSeamDatatableDynamicModule
  ],
  exports: [
    DynamicDatatablePageComponent
  ],
  entryComponents: [
    DynamicDatatablePageComponent
  ]
})
export class DynamicPagesModule { }
