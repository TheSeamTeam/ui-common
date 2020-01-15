import { Injectable } from '@angular/core'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { IDynamicActionUiAnchorDef } from '../../models/dynamic-action-ui-anchor-def'
import { IDynamicActionLink } from './dynamic-action-link'
import { IDynamicActionLinkDef } from './dynamic-action-link-def'

/**
 * Handles execution of link actions.
 */
@Injectable()
export class DynamicActionLinkService implements IDynamicActionLink {

  readonly type = 'link'

  label = 'Link Action'

  constructor(
    private _valueHandler: DynamicValueHelperService
  ) { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionLinkDef, context: any): Promise<IDynamicActionUiAnchorDef> {
    const link: string = await this._valueHandler.eval(args.link)
    const external: boolean = !!(await this._valueHandler.eval(args.external))
    const asset: boolean = !!(await this._valueHandler.eval(args.asset))
    const target: string | undefined = await this._valueHandler.eval(args.target)

    const def: IDynamicActionUiAnchorDef = {
      _actionDef: args,
      triggerType: asset ? 'link-asset' : external ? 'link-external' : 'link',
      linkUrl: link,
      // blockClickExpr: { type: 'jexl', expr: 'event.button == 0 && event.ctrlKey == true ? true : false' }
    }

    if (target) {
      if (!def.linkExtras) { def.linkExtras = {} }
      def.linkExtras.target = target
    }

    return def
  }
}
