import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core'

import { TheSeamDynamicComponentLoader } from '@lib/ui-common/dynamic-component-loader'

import { LazyWidgetOneComponent } from 'src/app/example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.component'

@Component({
  selector: 'app-example-lazy-loaded-widgets',
  templateUrl: './example-lazy-loaded-widgets.component.html',
  styleUrls: ['./example-lazy-loaded-widgets.component.scss']
})
export class ExampleLazyLoadedWidgetsComponent implements OnInit {

  @ViewChild('testOutlet', { static: true, read: ViewContainerRef }) testOutlet: ViewContainerRef

  widgets: any[] = []

  constructor(
    private _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader
  ) { }

  ngOnInit() { }

  loadComponent() {
    this._dynamicComponentLoaderModule
      .getComponentFactory<LazyWidgetOneComponent>('widget-one')
      .subscribe(componentFactory => {
        console.log('componentFactory', componentFactory)

        this.widgets = [ {
          type: componentFactory.componentType,
          componentFactoryResolver: (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
        } ]
      }, error => {
        console.warn(error)
      })
  }

}
