import { Injectable } from '@angular/core'

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

  }
}
