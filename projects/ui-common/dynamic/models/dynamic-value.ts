import { DynamicValueBaseType } from './dynamic-value-base-type'
import { DynamicValueEvaluatableType } from './dynamic-value-evaluatable-type'
import { IDynamicValueType } from './dynamic-value-type'

export type DynamicValue<R extends DynamicValueBaseType> = DynamicValueEvaluatableType<R> | R
