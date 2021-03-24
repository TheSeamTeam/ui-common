import { ComponentPortal } from '@angular/cdk/portal'
import { ComponentFactoryResolver, Inject, Injectable, Injector, ViewContainerRef } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { map } from 'rxjs/operators'

import { TheSeamDynamicComponentLoader } from '@theseam/ui-common/dynamic-component-loader'

import { IWidgetRegistryRecord } from './widget-registry.models'
import { THESEAM_WIDGETS } from './widget-token'

/**
 * Registry is to provide a way to manage widgets in a way that we can load them
 * the same way throughout the app, whether the component itself is registered,
 * the component is lazy-loaded, or referenced by an id stored in the database.
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetRegistryService {

  constructor(
    @Inject(THESEAM_WIDGETS) private _widgets: IWidgetRegistryRecord[],
    private _dynamicComponentLoader: TheSeamDynamicComponentLoader
  ) { }

  public createWidgetPortal<T>(
    widgetId: string,
    viewContainerRef?: ViewContainerRef | null,
    injector?: Injector | null,
    componentFactoryResolver?: ComponentFactoryResolver | null | undefined
  ): Observable<ComponentPortal<T>> {
    const widgetDef = (this._widgets || []).find(w => w.widgetId === widgetId)

    if (!widgetDef) {
      return throwError(`WidgetRegstry: Unknown widgetId "${widgetId}"`)
    }

    if (typeof widgetDef.componentOrComponentId === 'string') {
      return this._dynamicComponentLoader
        .getComponentFactory<T>(widgetDef.componentOrComponentId)
        .pipe(
          map(componentFactory => {
            let resolver: ComponentFactoryResolver | null | undefined = componentFactoryResolver
            if (!resolver) {
              const m = (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule
              if (m && m.componentFactoryResolver) {
                resolver = m.componentFactoryResolver
              }
            }

            const portal = new ComponentPortal(
              componentFactory.componentType,
              viewContainerRef,
              injector,
              resolver
            )

            return portal
          }
        )
      )
    } else {
      const portal = new ComponentPortal(
        widgetDef.componentOrComponentId,
        viewContainerRef,
        injector,
        componentFactoryResolver
      )

      return of(portal)
    }
  }
}
