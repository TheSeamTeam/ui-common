// NOTE: ng-packagr ignores the "types" and "typeRoots" settings in tsconfig.
// Unless there is a way to make it stop ignoring those settings, tripple slash
// reference to a `.d.ts` file was the only way I could stop the missing types
// error.
// /// <reference path="./jexl.d.ts" />
// /// <reference path="../../../../../custom_types/jexl/index.d.ts" />

import { DatePipe } from '@angular/common'
import { Injectable } from '@angular/core'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Missing types
import jexl from 'jexl'

import { DynamicValueBaseType } from '../../models/dynamic-value-base-type'
import { IDynamicValueEvaluator } from '../../models/dynamic-value-evaluator'

import { IJexlValue } from './jexl-value'

@Injectable()
export class JexlEvaluator implements IDynamicValueEvaluator<'jexl'> {

  public readonly type = 'jexl'

  private readonly _jexl = new jexl.Jexl()

  constructor() {
    this._jexl.addTransform('date', (val: any, row: any) => new DatePipe('en-US').transform(val, 'yyyy-MM-dd h:mm aaa'))
    this._jexl.addTransform('length', (val: any) => val !== null && val !== undefined ? val.length : 0)
  }

  public eval<R extends DynamicValueBaseType>(value: IJexlValue<R>, context?: any): Promise<R> {
    return this._jexl.eval(value.expr, context)
  }

  public evalSync<R extends DynamicValueBaseType>(value: IJexlValue<R>, context?: any): R {
    return this._jexl.evalSync(value.expr, context)
  }

}
