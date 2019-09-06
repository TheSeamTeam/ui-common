import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { DynamicComponentLoaderModule } from 'projects/ui-common/src/lib/dynamic-component-loader/dynamic-component-loader.module'
import { LazyWidgetOneComponent } from 'src/app/example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.component'

@NgModule({
  declarations: [
    LazyWidgetOneComponent
  ],
  imports: [
    CommonModule,
    DynamicComponentLoaderModule.forChild(LazyWidgetOneComponent),
  ]
})
export class LazyWidgetOneModule { }
