import { ComponentPortal, ComponentType } from '@angular/cdk/portal'

export interface IDashboardWidgetsItemDef<T = any> {
  widgetId: number
  col?: number
  order?: number

  componentFactoryResolver?: any
  type: ComponentType<T>
}

export interface IDashboardWidgetsItem<T = any> {
  widgetId: number
  col: number
  order: number

  portal: ComponentPortal<T>

  __itemDef: IDashboardWidgetsItemDef
}

export interface IDashboardWidgetsColumnRecord {
  column: number
  items: IDashboardWidgetsItem[]
}
