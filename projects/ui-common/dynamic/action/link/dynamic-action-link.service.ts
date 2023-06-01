import { Injectable } from '@angular/core'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { DynamicActionUiAnchorDef } from '../../models/dynamic-action-ui-anchor-def'
import { DynamicActionLink } from './dynamic-action-link'
import { DynamicActionLinkDef } from './dynamic-action-link-def'

/**
 * Handles execution of link actions.
 */
@Injectable()
export class DynamicActionLinkService implements DynamicActionLink {

  readonly type = 'link'

  label = 'Link Action'

  constructor(
    private _valueHandler: DynamicValueHelperService
  ) { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: DynamicActionLinkDef, context: any): Promise<DynamicActionUiAnchorDef> {
    const link: string = await this._valueHandler.eval(args.link)
    const external = !!(await this._valueHandler.eval(args.external))
    const asset = !!(await this._valueHandler.eval(args.asset))
    const target: string | undefined = await this._valueHandler.eval(args.target)
    const queryParams: { [k: string]: any } | undefined = await this._valueHandler.eval(args.queryParams)

    const def: DynamicActionUiAnchorDef = {
      _actionDef: args,
      triggerType: asset ? 'link-asset' : external ? 'link-external' : 'link',
      linkUrl: link,
      // blockClickExpr: { type: 'jexl', expr: 'event.button == 0 && event.ctrlKey == true ? true : false' }
    }

    if (target) {
      if (!def.linkExtras) { def.linkExtras = {} }
      def.linkExtras.target = target
    }

    if (queryParams) {
      if (!def.linkExtras) { def.linkExtras = {} }
      def.linkExtras.queryParams = queryParams
    }

    return def
  }
}
