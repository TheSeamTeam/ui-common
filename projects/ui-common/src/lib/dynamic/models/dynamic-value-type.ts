import { DynamicValuePrimitive } from './dynamic-value-primitive'

export interface IDynamicValueType<T = string, R = DynamicValuePrimitive | { [key: string]: any }> {
  type: T

  // TODO: Fix model to avoid this.
  [key: string]: any
}
