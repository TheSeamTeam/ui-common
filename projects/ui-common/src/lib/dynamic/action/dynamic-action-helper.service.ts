import { Inject, Injectable, isDevMode, Optional } from '@angular/core'
import { map } from 'rxjs/operators'

import { SeamConfirmDialogService } from '@lib/ui-common/confirm-dialog'
import { ThemeTypes } from '@lib/ui-common/models'
import { hasProperty } from '@lib/ui-common/utils'

import { DynamicValueHelperService } from '../dynamic-value-helper.service'
import { DynamicAction } from '../models/dynamic-action'
import { DynamicActionDef } from '../models/dynamic-action-def'
import { DynamicActionUiDef } from '../models/dynamic-action-ui-def'
import { THESEAM_DYNAMIC_ACTION } from '../tokens/dynamic-action'

@Injectable({
  providedIn: 'root'
})
export class DynamicActionHelperService {

  private _actionMap = new Map<string, DynamicAction<string>>()

  constructor(
    private _valueHelper: DynamicValueHelperService,
    // TODO: Consider making the action confirm more generic
    @Optional() private _confirmDialog?: SeamConfirmDialogService,
    @Optional() @Inject(THESEAM_DYNAMIC_ACTION) actions?: DynamicAction<string>[]
  ) {
    // Only one evaluator should exist for a type, so map them for faster lookup.
    for (const e of (actions || [])) {
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
  public async exec<T extends string>(actionDef: DynamicActionDef<T>, context?: any): Promise<DynamicActionDef<T>> {
    const action = this._actionMap.get(actionDef.type)
    if (!action) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' not found.`)
    }
    if (!action.exec) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' does not implement 'exec()'.`)
    }

    if (await this.requiresConfirmation(actionDef, context)) {
      const confirmed = await this.promptConfirmation(actionDef, context)
      if (!confirmed) {
        // TODO: Decide a good way to handle a rejected confirm.
        return 'rejected' as any
      }
    }

    return await action.exec(actionDef, context)
  }

  /**
   * Execute an action.
   *
   * TODO: Improve context and return typing.
   */
  public execSync<T extends string>(actionDef: DynamicActionDef<T>, context?: any): DynamicActionDef<T> {
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
   * Get UI props for action.
   *
   * TODO: Improve context and return typing.
   */
  public getUiProps<T extends string>(actionDef: DynamicActionDef<T>, context?: any): Promise<DynamicActionUiDef> {
    const action = this._actionMap.get(actionDef.type)
    if (!action) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' not found.`)
    }
    if (!action.getUiProps) {
      throw Error(`[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' does not implement 'getUiProps()'.`)
    }

    return action.getUiProps(actionDef, context)
  }

  /**
   * Checks if a DynamicActionDef is a type that can be executed.
   */
  public isExecutableType<T extends string>(value: DynamicActionDef<T>, isAsync: boolean): boolean {
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

  public async requiresConfirmation<T extends string>(actionDef: DynamicActionDef<T>, context?: any): Promise<boolean> {
    if (!hasProperty(actionDef, 'confirmDef')) {
      return false
    }

    if (hasProperty(actionDef.confirmDef, 'disabled')) {
      return !(await this._valueHelper.eval(actionDef.confirmDef.disabled, context))
    }

    return true
  }

  public requiresConfirmationSync<T extends string>(actionDef: DynamicActionDef<T>, context?: any): boolean {
    if (!hasProperty(actionDef, 'confirmDef')) {
      return false
    }

    if (hasProperty(actionDef.confirmDef, 'disabled')) {
      const disabled = !this._valueHelper.evalSync(actionDef.confirmDef.disabled, context)
      if (!disabled) {
        throw Error(
          `[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' can't open ` +
          `confirm dialog. Only async actions support confirm dialog.`
        )
      }
      return false
    }

    throw Error(
      `[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' can't open ` +
      `confirm dialog. Only async actions support confirm dialog.`
    )
  }

  public async promptConfirmation<T extends string>(actionDef: DynamicActionDef<T>, context?: any): Promise<boolean> {
    if (!this._confirmDialog) {
      throw Error(
        `[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' can't open ` +
        `confirm dialog. Confirm dialog service is not injected.`
      )
    }

    const confirmDef = actionDef.confirmDef
    if (!confirmDef) {
      throw Error(
        `[DynamicActionHelperService] Action '${actionDef ? actionDef.type : undefined}' can't open ` +
        `confirm dialog. Confirm def is not defined.`
      )
    }

    let message: string | undefined
    if (hasProperty(confirmDef, 'message')) {
      message = await this._valueHelper.eval(confirmDef.message, context)
    }
    let alert: string | { message: string, type: ThemeTypes } | undefined
    if (hasProperty(confirmDef, 'alert')) {
      alert = await this._valueHelper.eval(confirmDef.alert, context)
    }

    const modalDef = this._confirmDialog.open(message, alert)
    return modalDef.afterClosed().pipe(
      map(v => v === 'confirm')
    ).toPromise()
  }

}
