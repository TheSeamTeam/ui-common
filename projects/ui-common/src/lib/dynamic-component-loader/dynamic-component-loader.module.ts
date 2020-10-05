import {
  ANALYZE_FOR_ENTRY_COMPONENTS,
  ModuleWithProviders,
  NgModule,
  NgModuleFactoryLoader,
  SystemJsNgModuleLoader,
  Type,
} from '@angular/core'
import { ROUTES } from '@angular/router'

import { TheSeamDynamicComponentLoader } from './dynamic-component-loader.service'
import type { IDynamicComponentManifest } from './dynamic-component-manifest'
import {
  DYNAMIC_COMPONENT,
  DYNAMIC_COMPONENT_MANIFESTS,
  DYNAMIC_MODULE
} from './dynamic-component-tokens'

@NgModule()
export class TheSeamDynamicComponentLoaderModule {
  static forRoot(manifests: IDynamicComponentManifest[]): ModuleWithProviders<TheSeamDynamicComponentLoaderModule> {
    return {
      ngModule: TheSeamDynamicComponentLoaderModule,
      providers: [
        TheSeamDynamicComponentLoader,
        { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
        // provider for Angular CLI to analyze
        { provide: ROUTES, useValue: manifests, multi: true },
        // provider for TheSeamDynamicComponentLoader to analyze
        { provide: DYNAMIC_COMPONENT_MANIFESTS, useValue: manifests },
      ],
    }
  }
  static forModule(manifest: IDynamicComponentManifest): ModuleWithProviders<TheSeamDynamicComponentLoaderModule> {
    return {
      ngModule: TheSeamDynamicComponentLoaderModule,
      providers: [
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: manifest, multi: true },
        // provider for @angular/router to parse
        { provide: ROUTES, useValue: manifest, multi: true },
        // provider for TheSeamDynamicComponentLoader to analyze
        { provide: DYNAMIC_MODULE, useValue: manifest }],
    }
  }
  static forChild(component: Type<any>): ModuleWithProviders<TheSeamDynamicComponentLoaderModule> {
    return {
      ngModule: TheSeamDynamicComponentLoaderModule,
      providers: [
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: component, multi: true },
        // provider for @angular/router to parse
        { provide: ROUTES, useValue: [], multi: true },
        // provider for TheSeamDynamicComponentLoader to analyze
        { provide: DYNAMIC_COMPONENT, useValue: component },
      ],
    }
  }
}
