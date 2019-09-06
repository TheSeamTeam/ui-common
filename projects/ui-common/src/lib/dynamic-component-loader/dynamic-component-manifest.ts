import { InjectionToken } from '@angular/core'
import { LoadChildrenCallback } from '@angular/router'

export const DYNAMIC_COMPONENT = new InjectionToken<any>('DYNAMIC_COMPONENT')

export const DYNAMIC_MODULE = new InjectionToken<any>('DYNAMIC_MODULE')

export const DYNAMIC_COMPONENT_MANIFESTS = new InjectionToken<any>('DYNAMIC_COMPONENT_MANIFESTS')

export interface IDynamicComponentManifest {

  /** Unique identifier, used in the application to retrieve a ComponentFactory. */
  componentId: string

  /** Unique identifier, used internally by Angular. */
  path: string

  /** Component module import or Path to component module. */
  loadChildren: string | LoadChildrenCallback
}
