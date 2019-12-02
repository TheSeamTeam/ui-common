import { DynamicValue } from './dynamic-value'

export interface IDynamicAction<T = string> {

  readonly type: T

  label: DynamicValue

}
