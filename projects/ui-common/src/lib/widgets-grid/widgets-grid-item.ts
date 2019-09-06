import { ComponentPortal, ComponentType } from '@angular/cdk/portal'

export interface IWidgetsGridItemDef<T = any> {
  cols?: number
  rows?: number
  y?: number
  x?: number

  type: ComponentType<T>
}

export interface IWidgetsGridItem<T = any> extends IWidgetsGridItemDef<T> {
  portal: ComponentPortal<T>
}
