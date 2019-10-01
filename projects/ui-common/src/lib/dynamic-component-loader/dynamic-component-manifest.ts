import { LoadChildrenCallback } from '@angular/router'

export interface IDynamicComponentManifest {

  /** Unique identifier, used in the application to retrieve a ComponentFactory. */
  componentId: string

  /** Unique identifier, used internally by Angular. */
  path: string

  /** Component module import or Path to component module. */
  loadChildren: string | LoadChildrenCallback
}
