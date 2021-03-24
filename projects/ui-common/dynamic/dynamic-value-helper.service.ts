import { Inject, Injectable, isDevMode } from '@angular/core'

import { DynamicValue } from './models/dynamic-value'
import { DynamicValueEvaluatableType } from './models/dynamic-value-evaluatable-type'
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
  public eval<R>(value: DynamicValue<R>, context?: any): Promise<R> {
    if (this.isEvaluatableType(value, true)) {
      return this._evalEvaluatable(value, context)
    }

    // Use `evalSync` if `eval` isn't provided and `evalSync` is.
    if (this.isEvaluatableType(value, false)) {
      return Promise.resolve<R>(this._evalEvaluatableSync(value, context))
    }

    return Promise.resolve<R>(value)
  }

  /**
   * Evaluate a dynamic value to its actual value.
   *
   * TODO: Improve context and return typing.
   */
  public evalSync<R>(value: DynamicValue<R>, context?: any): R {
    if (this.isEvaluatableType(value, false)) {
      return this._evalEvaluatableSync(value, context)
    }

    return value
  }

  /**
   * Checks if a DynamicValue is a type that can be evaluated.
   */
  public isEvaluatableType<R>(value: DynamicValue<R>, isAsync: boolean): value is DynamicValueEvaluatableType<R> {
    if (value === undefined || value === null) {
      return false
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return false
    }

    if (!(<DynamicValueEvaluatableType<R>>value).type) {
      return false
    }

    if (this._evaluatorMap.has((<DynamicValueEvaluatableType<R>>value).type)) {
      return true
    }

    return false
  }

  /**
   *
   */
  private _evalEvaluatable<R>(value: DynamicValueEvaluatableType<R>, context?: any): Promise<R> {
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
  private _evalEvaluatableSync<R>(value: DynamicValueEvaluatableType<R>, context?: any): R {
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
