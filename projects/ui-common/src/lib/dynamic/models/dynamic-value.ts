import { DynamicValuePrimitive } from './dynamic-value-primitive'
import { IDynamicValueType } from './dynamic-value-type'

export type DynamicValue<R = DynamicValuePrimitive | { [key: string]: any }, T = string> = IDynamicValueType<T, R> | R
