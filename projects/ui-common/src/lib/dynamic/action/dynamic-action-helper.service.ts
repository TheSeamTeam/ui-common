import { Inject, Injectable, isDevMode } from '@angular/core'

import { IDynamicAction } from '../models/dynamic-action'
import { IDynamicActionDef } from '../models/dynamic-action-def'
import { THESEAM_DYNAMIC_ACTION } from '../tokens/dynamic-action'

@Injectable({
  providedIn: 'root'
})
export class DynamicActionHelperService {

  private _actionMap = new Map<string, IDynamicAction>()

  constructor(
    @Inject(THESEAM_DYNAMIC_ACTION) actions: IDynamicAction[]
  ) {
    // Only one evaluator should exist for a type, so map them for faster lookup.
    for (const e of actions) {
      if (isDevMode()) {
        if (this._actionMap.has(e.type)) {
          console.warn(`[DynamicActionHelperService] Multiple actions found for type '${e.type}'`)
        }
      }
      this._actionMap.set(e.type, e)
    }
  }

  /**
   * Execute an async action.
   *
   * TODO: Improve context and return typing.
   */
  public exec(actionDef: IDynamicActionDef, context?: any): Promise<IDynamicActionDef> {
    const action = this._actionMap.get(actionDef.type)
    if (!action) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' not found.`)
    }
    if (!action.exec) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' does not implement 'exec()'.`)
    }

    return action.exec(actionDef, context)
  }

  /**
   * Execute an action.
   *
   * TODO: Improve context and return typing.
   */
  public execSync(actionDef: IDynamicActionDef, context?: any): IDynamicActionDef {
    const action = this._actionMap.get(actionDef.type)
    if (!action) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' not found.`)
    }
    if (!action.execSync) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' does not implement 'execSync()'.`)
    }

    return action.execSync(actionDef, context)
  }

  /**
   * Checks if a IDynamicActionDef is a type that can be executed.
   */
  public isExecutableType(value: IDynamicActionDef, isAsync: boolean): boolean {
    if (value === undefined || value === null) {
      return false
    }

    const action  = this._actionMap.get(value.type)
    if (!action) {
      return false
    }

    if (isAsync && !action.exec) {
      return false
    }
    if (!isAsync && !action.execSync) {
      return false
    }

    return true
  }

}
