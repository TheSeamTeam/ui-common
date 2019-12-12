import { IDynamicValueType } from './dynamic-value-type'

export type DynamicValue = string | number | boolean | { [key: string]: any } | IDynamicValueType
