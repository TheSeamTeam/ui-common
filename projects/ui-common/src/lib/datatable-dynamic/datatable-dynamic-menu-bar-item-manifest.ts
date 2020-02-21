import { ComponentType } from '@angular/cdk/portal'

export interface IDatatableDynamicMenuBarItemManifest {

  /**
   * Unique name to represent this item in JSON def.
   */
  name: string

  /**
   * Component to render for this item.
   */
  component: ComponentType<{}> | string
}
