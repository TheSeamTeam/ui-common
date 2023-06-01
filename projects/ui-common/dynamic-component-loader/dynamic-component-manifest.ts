import { LoadChildren } from '@angular/router'

export interface DynamicComponentManifest {

  /** Unique identifier, used in the application to retrieve a ComponentFactory. */
  componentId: string

  /** Unique identifier, used internally by Angular. */
  path: string

  /** Component module import. */
  loadChildren: LoadChildren
}
