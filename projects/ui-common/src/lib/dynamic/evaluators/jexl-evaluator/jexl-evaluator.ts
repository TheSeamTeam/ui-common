import { Injectable } from '@angular/core'

import jexl from 'jexl'

import { IDynamicValueEvaluator } from '../../models/dynamic-value-evaluator'

import { IJexlValue } from './jexl-value'

@Injectable()
export class JexlEvaluator implements IDynamicValueEvaluator<'jexl'> {

  public readonly type = 'jexl'

  public eval(value: IJexlValue, context?: any): Promise<any> {
    return jexl.eval(value.expr, context)
  }

  public evalSync(value: IJexlValue, context?: any): any {
    return jexl.evalSync(value.expr, context)
  }

}
