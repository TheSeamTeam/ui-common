import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { HierarchyRouterOutletComponent } from './hierarchy-router-outlet/hierarchy-router-outlet.component'



@NgModule({
  declarations: [
    HierarchyRouterOutletComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HierarchyRouterOutletComponent
  ]
})
export class TheSeamDynamicRouterModule { }
