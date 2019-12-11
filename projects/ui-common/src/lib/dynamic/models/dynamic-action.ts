import { Observable } from 'rxjs'

import { IDynamicActionApiArgs } from '../action/api/dynamic-action-api-args'

import { DynamicValue } from './dynamic-value'

export interface IDynamicAction<T = string, D = any, R = any> {

  readonly type: T

  // TODO: Is this neccessary?
  label: DynamicValue

  exec?: (args: IDynamicActionApiArgs, context: D) => Observable<R>

  execSync?: (args: IDynamicActionApiArgs, context: D) => R

}
