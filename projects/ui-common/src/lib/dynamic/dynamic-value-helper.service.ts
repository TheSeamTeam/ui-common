import { Injectable, isDevMode } from '@angular/core'

import jexl from 'jexl'

import { DynamicValue } from './models/dynamic-value'

@Injectable({
  providedIn: 'root'
})
export class DynamicValueHelperService {

  constructor() { }

  /**
   * Evaluate a dynamic value to its actual value.
   *
   * TODO: Make async evaluation possible. A datatable bug is preventing this.
   */
  public eval(value: DynamicValue, context?: any): any {
    if (this.isTransformableType(value)) {

    }
  }

  /**
   * Checks is a DynamicValue is a type that can be transformed.
   */
  public isTransformableType(value: DynamicValue): boolean {
    if (value === undefined || value === null) {
      return false
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return false
    }

    if (value.type === 'jexl') {
      return true
    }

    if (isDevMode()) {
      console.warn('[DynamicValueHelperService] DynamicValue type not recognized.', value)
    }

    return false
  }
}
