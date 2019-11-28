import { IDynamicValueType } from './dynamic-value-type'

export interface IDynamicValueEvaluator<T = string> {

  readonly evaluatorType: T

  eval?(value: IDynamicValueType<T>, context?: any): Promise<any>

  evalSync?(value: IDynamicValueType<T>, context?: any): any

}
