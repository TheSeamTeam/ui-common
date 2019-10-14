import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core'
import { TheSeamDynamicComponentLoader } from 'projects/ui-common/src/lib/dynamic-component-loader/dynamic-component-loader.service'
import { IWidgetsGridItemDef } from 'projects/ui-common/src/lib/widgets-grid/widgets-grid-item'
import { LazyWidgetOneComponent } from 'src/app/example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.component'

@Component({
  selector: 'app-example-lazy-loaded-widgets',
  templateUrl: './example-lazy-loaded-widgets.component.html',
  styleUrls: ['./example-lazy-loaded-widgets.component.scss']
})
export class ExampleLazyLoadedWidgetsComponent implements OnInit {

  @ViewChild('testOutlet', { static: true, read: ViewContainerRef }) testOutlet: ViewContainerRef

  widgets: IWidgetsGridItemDef[] = []

  constructor(
    private _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader
  ) { }

  ngOnInit() { }

  loadComponent() {
    this._dynamicComponentLoaderModule
      .getComponentFactory<LazyWidgetOneComponent>('widget-one')
      .subscribe(componentFactory => {
        console.log('componentFactory', componentFactory)
        // const ref = this.testOutlet.createComponent(componentFactory)
        // ref.changeDetectorRef.detectChanges()

        // if ((<any>componentFactory).ngModule) {
        //   const factory: any /* ComponentFactoryBoundToModule */
        // }

        this.widgets = [ {
          type: componentFactory.componentType,
          componentFactoryResolver: (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
        } ]
      }, error => {
        console.warn(error)
      })
  }

}
