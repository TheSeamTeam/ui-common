import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { DynamicRouterComponentOutletComponent } from './dynamic-router-component-outlet/dynamic-router-component-outlet.component'
import { HierarchyRouterOutletComponent } from './hierarchy-router-outlet/hierarchy-router-outlet.component'



@NgModule({
  declarations: [
    DynamicRouterComponentOutletComponent,
    HierarchyRouterOutletComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    DynamicRouterComponentOutletComponent,
    HierarchyRouterOutletComponent
  ]
})
export class TheSeamDynamicRouterModule { }
