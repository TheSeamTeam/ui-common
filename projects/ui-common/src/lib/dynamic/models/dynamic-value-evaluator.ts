import { DynamicValue } from './dynamic-value'

export interface IDynamicValueEvaluator<T = string> {

  readonly evaluatorType: T

  eval?(value: DynamicValue, context?: any): Promise<any>

  evalSync?(value: DynamicValue, context?: any): any

}
