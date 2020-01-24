import { ComponentPortal, ComponentType } from '@angular/cdk/portal'

export interface IDashboardWidgetsItemDef<T = any> {
  widgetId: string
  col?: number
  order?: number

  componentFactoryResolver?: any
  component: ComponentType<T> | string
}

export interface IDashboardWidgetsItem<T = any> {
  widgetId: string
  col: number
  order: number

  portal: ComponentPortal<T>

  __itemDef: IDashboardWidgetsItemDef
}

export interface IDashboardWidgetsColumnRecord {
  column: number
  items: IDashboardWidgetsItem[]
}

export interface IDashboardWidgetsItemSerialized {
  readonly widgetId: string
  readonly col: number
  readonly order: number
  readonly component: string
}

export interface IDashboardWidgetItemLayoutSerialized {
  readonly name: string

  /**
   * If not provided, the name will be used for the label.
   */
  readonly label?: string

  readonly items: IDashboardWidgetsItemSerialized[]
}
