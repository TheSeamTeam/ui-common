import { InjectionToken } from '@angular/core'

import { IDynamicValueEvaluator } from '../models/dynamic-value-evaluator'

export const THESEAM_DYNAMIC_VALUE_EVALUATOR = new InjectionToken<IDynamicValueEvaluator>(
  'Evaluator that can be used for evaluating a DynamicValue'
)
