import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DynamicRouterComponentOutletComponent } from './dynamic-router-component-outlet/dynamic-router-component-outlet.component'



@NgModule({
  declarations: [DynamicRouterComponentOutletComponent],
  imports: [
    CommonModule
  ],
  exports: [DynamicRouterComponentOutletComponent]
})
export class TheSeamDynamicRouterModule { }
