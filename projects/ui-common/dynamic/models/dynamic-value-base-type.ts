import { DynamicValuePrimitive } from './dynamic-value-primitive'

export type DynamicValueBaseType = DynamicValuePrimitive | { [key: string]: any }
