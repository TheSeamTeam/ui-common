import { IJexlValue } from '../evaluators/jexl-evaluator/jexl-value'

import { DynamicValueBaseType } from './dynamic-value-base-type'

export type DynamicValueEvaluatableType<R extends DynamicValueBaseType> = IJexlValue<R>
