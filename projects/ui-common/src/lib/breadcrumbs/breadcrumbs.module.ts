import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component'


@NgModule({
  declarations: [
    BreadcrumbsComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    BreadcrumbsComponent
  ]
})
export class TheSeamBreadcrumbsModule { }
