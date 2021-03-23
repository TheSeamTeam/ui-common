import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ExampleLazyLoadedWidgetsModule } from './example-lazy-loaded-widgets/example-lazy-loaded-widgets.module'

import {
  IDynamicComponentManifest,
  TheSeamDynamicComponentLoaderModule
} from '@lib/ui-common/dynamic-component-loader'
import { AppComponent } from './app.component'

const manifests: IDynamicComponentManifest[] = [
  {
    componentId: 'widget-one',
    path: 'widget-one',
    loadChildren: () => import('./example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.module').then(m => m.LazyWidgetOneModule)
  }
]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TheSeamDynamicComponentLoaderModule.forRoot(manifests),
    ExampleLazyLoadedWidgetsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
