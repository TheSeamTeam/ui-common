import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core'
import { DynamicComponentLoader } from 'projects/ui-common/src/lib/dynamic-component-loader/dynamic-component-loader.service'
import { LazyWidgetOneComponent } from 'src/app/example-lazy-loaded-widgets/lazy-widget-one/lazy-widget-one.component'

@Component({
  selector: 'app-example-lazy-loaded-widgets',
  templateUrl: './example-lazy-loaded-widgets.component.html',
  styleUrls: ['./example-lazy-loaded-widgets.component.scss']
})
export class ExampleLazyLoadedWidgetsComponent implements OnInit {

  @ViewChild('testOutlet', { static: true, read: ViewContainerRef }) testOutlet: ViewContainerRef

  constructor(
    private dynamicComponentLoader: DynamicComponentLoader
  ) { }

  ngOnInit() { }

  loadComponent() {
    this.dynamicComponentLoader
      .getComponentFactory<LazyWidgetOneComponent>('widget-one')
      .subscribe(componentFactory => {
        const ref = this.testOutlet.createComponent(componentFactory)
        ref.changeDetectorRef.detectChanges()
      }, error => {
        console.warn(error)
      })
  }

}
