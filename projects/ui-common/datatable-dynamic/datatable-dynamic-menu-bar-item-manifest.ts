import { ComponentType } from '@angular/cdk/portal'
import { InjectionToken } from '@angular/core'

export interface IDatatableDynamicMenuBarItemManifest<T = any> {

  /**
   * Unique name to represent this item in JSON def.
   */
  name: string

  /**
   * Component to render for this item.
   */
  component: ComponentType<object> | string

  /**
   * InjectionToken to inject data as.
   */
  dataToken?: InjectionToken<T>
}
