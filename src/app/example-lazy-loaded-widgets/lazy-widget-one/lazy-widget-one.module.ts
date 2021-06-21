import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamDynamicComponentLoaderModule } from '@theseam/ui-common/dynamic-component-loader'
import { TheSeamWidgetModule } from '@theseam/ui-common/widget'

import { LazyWidgetOneComponent } from 'src/app/example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.component'

@NgModule({
  declarations: [
    LazyWidgetOneComponent
  ],
  imports: [
    CommonModule,
    TheSeamWidgetModule,
    // TheSeamDynamicComponentLoaderModule.forChild(LazyWidgetOneComponent),
  ]
})
export class LazyWidgetOneModule { }
