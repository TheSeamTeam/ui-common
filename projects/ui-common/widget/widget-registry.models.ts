import { ComponentType } from '@angular/cdk/portal'

export interface IWidgetRegistryRecord<T = any, D = any> {
  /**
   * Unique identifier of a widget.
   *
   * This allows us to reference a widget with a string no matter how we
   * register it.
   */
  widgetId: string

  /**
   * Component class or the component id for a lazy-loaded component.
   */
  componentOrComponentId: ComponentType<T> | string

  /**
   * NOTE: NOT IMPLEMENTED YET.
   *
   * Passed to the widget through the WidgetRef.
   */
  data?: D
}
