import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicComponentManifest, TheSeamDynamicComponentLoaderModule } from '@lib/ui-common/dynamic-component-loader'

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

    TheSeamDynamicComponentLoaderModule.forModule(manifests[0]),
  ],
  exports: [
    ExampleLazyLoadedWidgetsComponent
  ]
})
export class ExampleLazyLoadedWidgetsModule { }
