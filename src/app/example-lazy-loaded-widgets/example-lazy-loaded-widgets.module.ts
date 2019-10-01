import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { DynamicComponentLoaderModule } from 'projects/ui-common/src/lib/dynamic-component-loader/dynamic-component-loader.module'
import { IDynamicComponentManifest } from 'projects/ui-common/src/lib/dynamic-component-loader/dynamic-component-manifest'
import { TheSeamWidgetsGridModule } from 'projects/ui-common/src/lib/widgets-grid/widgets-grid.module'
import { ExampleLazyLoadedWidgetsComponent } from './example-lazy-loaded-widgets.component'

// This array defines which "componentId" maps to which lazy-loaded module.
const manifests: IDynamicComponentManifest[] = [
  {
    componentId: 'widget-one',
    path: 'widget-one',
    loadChildren: () => import('./lazy-widget-one/lazy-widget-one.module').then(m => m.LazyWidgetOneModule)
  }
]

@NgModule({
  declarations: [
    ExampleLazyLoadedWidgetsComponent
  ],
  imports: [
    CommonModule,
    TheSeamWidgetsGridModule,

    DynamicComponentLoaderModule.forModule(manifests[0]),
  ],
  exports: [
    ExampleLazyLoadedWidgetsComponent
  ]
})
export class ExampleLazyLoadedWidgetsModule { }
