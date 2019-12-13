import { Observable } from 'rxjs'

import { IDynamicActionDef } from './dynamic-action-def';
import { DynamicValue } from './dynamic-value'

export interface IDynamicAction<T = string, D = any, R = any> {

  readonly type: T

  // TODO: Is this neccessary?
  label: DynamicValue

  exec?: (args: IDynamicActionDef, context: D) => Observable<R>

  execSync?: (args: IDynamicActionDef, context: D) => R

}
