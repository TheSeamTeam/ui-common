import { DynamicValueBaseType } from './dynamic-value-base-type'

export interface IDynamicValueType<T = string, R = DynamicValueBaseType> {
  type: T

  // // TODO: Fix model to avoid this.
  // [key: string]: any
}
