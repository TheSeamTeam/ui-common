import { Injectable } from '@angular/core'

import jexl from 'jexl'

import { IDynamicValueEvaluator } from '../../models/dynamic-value-evaluator'

import { IJexlValue } from './jexl-value'

@Injectable()
export class JexlEvaluator implements IDynamicValueEvaluator<'jexl'> {

  public readonly type = 'jexl'

  public eval<R>(value: IJexlValue<R>, context?: any): Promise<R> {
    return jexl.eval(value.expr, context)
  }

  public evalSync<R>(value: IJexlValue<R>, context?: any): R {
    return jexl.evalSync(value.expr, context)
  }

}
