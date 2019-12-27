import { Injectable } from '@angular/core'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { IDynamicActionUiDef } from '../../models/dynamic-action-ui-def'
import { IDynamicActionLink } from './dynamic-action-link'
import { IDynamicActionLinkDef } from './dynamic-action-link-def'

/**
 * Handles execution of link actions.
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicActionLinkService implements IDynamicActionLink {

  readonly type = 'link'

  label = 'Link Action'

  constructor(
    private _valueHandler: DynamicValueHelperService
  ) { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionLinkDef, context: any): Promise<IDynamicActionUiDef<'link'>> {
    const link: string = await this._valueHandler.eval(args.link)
    const external: boolean = !!(await this._valueHandler.eval(args.external))
    const encrypted: boolean = !!(await this._valueHandler.eval(args.encrypted))
    const target: string | undefined = await this._valueHandler.eval(args.target)

    const def: IDynamicActionUiDef<'link'> = {
      type: this.type,
      triggerType: encrypted ? 'link-asset' : external ? 'link-external' : 'link',
      linkUrl: link
    }

    if (target) {
      if (!def.linkExtras) { def.linkExtras = {} }
      def.linkExtras.target = target
    }

    return def
  }
}
