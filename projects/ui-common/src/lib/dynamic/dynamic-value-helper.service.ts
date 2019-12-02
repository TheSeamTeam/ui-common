import { Inject, Injectable, isDevMode } from '@angular/core'

import { DynamicValue } from './models/dynamic-value'
import { IDynamicValueEvaluator } from './models/dynamic-value-evaluator'
import { IDynamicValueType } from './models/dynamic-value-type'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from './tokens/dynamic-value-evaluator'

/**
 *
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicValueHelperService {

  private _evaluatorMap = new Map<string, IDynamicValueEvaluator>()

  constructor(
    @Inject(THESEAM_DYNAMIC_VALUE_EVALUATOR) evaluators: IDynamicValueEvaluator[]
  ) {
    // Only one evaluator should exist for a type, so map them for faster lookup.
    for (const e of evaluators) {
      if (isDevMode()) {
        if (this._evaluatorMap.has(e.type)) {
          console.warn(`[DynamicValueHelperService] Multiple evaluators found for type '${e.type}'`)
        }
      }
      this._evaluatorMap.set(e.type, e)
    }
  }

  /**
   * Evaluate a dynamic value to its actual value.
   *
   * TODO: Improve context and return typing.
   */
  public eval(value: DynamicValue, context?: any): Promise<any> {
    if (this.isEvaluatableType(value, true)) {
      return this._evalEvaluatable(<IDynamicValueType>value, context)
    }

    return Promise.resolve(value)
  }

  /**
   * Evaluate a dynamic value to its actual value.
   *
   * TODO: Improve context and return typing.
   */
  public evalSync(value: DynamicValue, context?: any): any {
    if (this.isEvaluatableType(value, false)) {
      return this._evalEvaluatableSync(<IDynamicValueType>value, context)
    }

    return value
  }

  /**
   * Checks is a DynamicValue is a type that can be evaluated.
   */
  public isEvaluatableType(value: DynamicValue, isAsync: boolean): boolean {
    if (value === undefined || value === null) {
      return false
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return false
    }

    if (this._evaluatorMap.has(value.type)) {
      return true
    }

    return false
  }

  /**
   *
   */
  private _evalEvaluatable(value: IDynamicValueType, context?: any): Promise<any> {
    const evaluator = this._evaluatorMap.get(value.type)
    if (!evaluator) {
      throw Error(`[DynamicValueHelperService] Evaluator '${value ? value.type : undefined}' not found.`)
    }
    if (!evaluator.eval) {
      throw Error(`[DynamicValueHelperService] Evaluator '${value ? value.type : undefined}' does not implement 'eval()'.`)
    }
    return evaluator.eval(value, context)
  }

  /**
   *
   */
  private _evalEvaluatableSync(value: IDynamicValueType, context?: any): any {
    const evaluator = this._evaluatorMap.get(value.type)
    if (!evaluator) {
      throw Error(`[DynamicValueHelperService] Evaluator '${value ? value.type : undefined}' not found.`)
    }
    if (!evaluator.evalSync) {
      throw Error(`[DynamicValueHelperService] Evaluator '${value ? value.type : undefined}' does not implement 'evalSync()'.`)
    }
    return evaluator.evalSync(value, context)
  }

}
