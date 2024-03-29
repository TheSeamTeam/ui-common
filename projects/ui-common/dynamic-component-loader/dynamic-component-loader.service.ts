import { Compiler, ComponentFactory, Inject, Injectable, Injector, NgModuleFactory, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { from, throwError } from 'rxjs'
import { mergeMap, switchMap } from 'rxjs/operators'

import { LoadChildren } from '@angular/router'
import { DynamicComponentManifest } from './dynamic-component-manifest'
import {
  DYNAMIC_COMPONENT,
  DYNAMIC_COMPONENT_MANIFESTS,
  DYNAMIC_MODULE
} from './dynamic-component-tokens'

import { wrapIntoObservable } from '@theseam/ui-common/utils'

@Injectable({
  providedIn: 'root'
})
export class TheSeamDynamicComponentLoader {

  private _manifests: DynamicComponentManifest[]

  constructor(
    private compiler: Compiler,
    private injector: Injector,
    @Optional() @Inject(DYNAMIC_COMPONENT_MANIFESTS) manifests: DynamicComponentManifest[],
  ) { this._manifests = manifests || [] }

  /** Retrieve a ComponentFactory, based on the specified componentId (defined in the DynamicComponentManifest array). */
  getComponentFactory<T>(componentId: string, injector?: Injector): Observable<ComponentFactory<T>> {
    const manifest = this._manifests
      .find(m => m.componentId === componentId)
    if (!manifest) {
      return throwError(`TheSeamDynamicComponentLoader: Unknown componentId "${componentId}"`)
    }

    // const path = manifest.loadChildren

    // const p = this.load<T>(path, componentId, injector)
    // return from(p)

    const moduleFactory$ = this.loadModuleFactory(manifest.loadChildren)

    return moduleFactory$
      .pipe(switchMap(m => from(this.loadFactory<any>(m, componentId, injector))))
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    return wrapIntoObservable(loadChildren()).pipe(mergeMap((t: any) => {
      if (t instanceof NgModuleFactory) {
        return of(t)
      } else {
        return from(this.compiler.compileModuleAsync(t))
      }
    }))
  }

  private loadFactory<T>(ngModuleFactory: NgModuleFactory<any>, componentId: string, injector?: Injector): Promise<ComponentFactory<T>> {
    const moduleRef = ngModuleFactory.create(injector || this.injector)
    const dynamicComponentType = moduleRef.injector.get(DYNAMIC_COMPONENT, null)
    if (!dynamicComponentType) {
      const dynamicModule: DynamicComponentManifest = moduleRef.injector.get(DYNAMIC_MODULE, null)

      if (!dynamicModule) {
        throw new Error(
          'TheSeamDynamicComponentLoader: Dynamic module for' +
          ` componentId "${componentId}" does not contain` +
          ' DYNAMIC_COMPONENT or DYNAMIC_MODULE as a provider.',
        )
      }
      if (dynamicModule.componentId !== componentId) {
        throw new Error(
          'TheSeamDynamicComponentLoader: Dynamic module for' +
          `${componentId} does not match manifest.`,
        )
      }

      const path = dynamicModule.loadChildren

      if (!path) {
        throw new Error(`${componentId} unknown!`)
      }

      // return this.load<T>(path, componentId, injector)
      const moduleFactory$ = this.loadModuleFactory(dynamicModule.loadChildren)

      return moduleFactory$
        .pipe(switchMap(m => from(this.loadFactory<any>(m, componentId, injector))))
        .toPromise() as Promise<ComponentFactory<T>>
    }

    return Promise.resolve(moduleRef.componentFactoryResolver.resolveComponentFactory<T>(dynamicComponentType))
  }
}
