import { DatePipe } from '@angular/common'
import { Injectable } from '@angular/core'

import jexl from 'jexl'

import { IDynamicValueEvaluator } from '../../models/dynamic-value-evaluator'

import { IJexlValue } from './jexl-value'

@Injectable()
export class JexlEvaluator implements IDynamicValueEvaluator<'jexl'> {

  public readonly type = 'jexl'

  private readonly _jexl = new jexl.Jexl()

  constructor() {
    this._jexl.addTransform('date', (val, row) => new DatePipe('en-US').transform(val, 'MM-dd-yyyy h:mm aaa'))
  }

  public eval<R>(value: IJexlValue<R>, context?: any): Promise<R> {
    return this._jexl.eval(value.expr, context)
  }

  public evalSync<R>(value: IJexlValue<R>, context?: any): R {
    return this._jexl.evalSync(value.expr, context)
  }

}
